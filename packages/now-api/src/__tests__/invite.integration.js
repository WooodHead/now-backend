import gql from 'graphql-tag';
import { LocalDate, LocalDateTime, ZoneId } from 'js-joda';
import uuid from 'uuid/v4';

import { client, USER_ID, newUserClient } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Rsvp, Invitation } from '../db/repos';
import loaders from '../db/loaders';
import { mockNow, restoreNow } from '../../testutils/date';
import * as Activity from '../schema/resolvers/Activity';
import rejectExpiredEventInvites from '../jobs/rejectExpiredEventInvites';

const location = factory.build('location');
const user = factory.build('user', { id: USER_ID });

const createEventInvite = eventId =>
  client.mutate({
    mutation: gql`
      mutation create($input: CreateEventInvitationInput!) {
        createEventInvitation(input: $input) {
          invitation {
            id
            code
            expiresAt
            message
            inviter {
              id
            }
            usedAt
            event {
              id
            }
          }
        }
      }
    `,
    variables: { input: { eventId } },
  });

const checkInvitation = code =>
  client.query({
    query: gql`
      query checkInvitation($code: String) {
        checkInvitation(code: $code) {
          code
          eventId
          type
        }
      }
    `,
    variables: { code },
  });

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.ACTIVITIES).truncate(),
    sql(SQL_TABLES.INVITATIONS).truncate(),
    sql(SQL_TABLES.LOCATIONS).truncate(),
    sql(SQL_TABLES.EVENTS).truncate(),
    sql(SQL_TABLES.RSVPS).truncate(),
    sql(SQL_TABLES.RSVP_LOG).truncate(),
    sql(SQL_TABLES.USERS).truncate(),
  ]);

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.LOCATIONS).insert(location),
      sql(SQL_TABLES.USERS).insert(user),
    ])
  ));
afterEach(() => truncateTables());

describe('Invitations', () => {
  describe('Check invitations', () => {
    it('returns data if valid', async () => {
      const invite = factory.build('appInvite');
      await Invitation.insert(invite);

      const results = await checkInvitation(invite.code);

      expect(results.data.checkInvitation).toEqual(
        expect.objectContaining({
          __typename: 'InvitationCheck',
          code: invite.code,
          type: invite.type,
          eventId: null,
          [Symbol('id')]: `$ROOT_QUERY.checkInvitation({"code":"${
            invite.code
          }"})`,
        })
      );
    });
    it('returns error if not found', async () => {
      await expect(checkInvitation('1234')).rejects.toEqual(
        new Error(`GraphQL error: Invite not found.`)
      );
    });
    it('returns error if expired', async () => {
      const invite = factory.build('appInvite', {
        expiresAt: LocalDateTime.now()
          .minusDays(1)
          .toString(),
      });
      await Invitation.insert(invite);

      await expect(checkInvitation(invite.code)).rejects.toEqual(
        new Error(`GraphQL error: This invite has expired.`)
      );
    });
    it('returns error if used', async () => {
      const invite = factory.build('appInvite', {
        usedAt: LocalDateTime.now()
          .minusDays(1)
          .toString(),
      });
      await Invitation.insert(invite);

      await expect(checkInvitation(invite.code)).rejects.toEqual(
        new Error(`GraphQL error: This invite has been used already.`)
      );
    });
  });
  describe('Event Invitations', () => {
    const buildEventTomorrow = async () => {
      const tomorrow = LocalDate.now(Activity.NYC_TZ).plusDays(1);
      const activity = factory.build('activity', {
        activityDate: tomorrow.toString(),
      });
      await sql(SQL_TABLES.ACTIVITIES).insert(activity);

      const eventTomorrow = factory.build(
        'event',
        {
          time: tomorrow
            .atTime(14, 0)
            .atZone(ZoneId.UTC)
            .toString(),
          timezone: Activity.NYC_TZ.id(),
        },
        { activity, location }
      );
      await sql(SQL_TABLES.EVENTS).insert([eventTomorrow]);
      return eventTomorrow;
    };
    beforeEach(async () => {
      await sql(SQL_TABLES.EVENTS).truncate();
    });
    afterEach(() => {
      restoreNow();
    });

    it('creates before event start', async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );

      const eventTomorrow = await buildEventTomorrow();

      const results = await createEventInvite(eventTomorrow.id);

      const { data } = results;
      const { invitation } = data.createEventInvitation;

      expect(invitation).toMatchObject({
        __typename: 'EventInvitation',
        inviter: {
          id: USER_ID,
        },
        usedAt: null,
        event: {
          id: eventTomorrow.id,
        },
        expiresAt: eventTomorrow.time,
      });

      expect(invitation.code).toEqual(expect.stringMatching(/\d{6}/));

      const dbRsvps = await Rsvp.all({ eventId: eventTomorrow.id }).orderBy(
        'inviteId'
      );
      expect(dbRsvps).toEqual([
        expect.objectContaining({
          action: 'add',
          eventId: eventTomorrow.id,
          inviteId: data.createEventInvitation.invitation.id,
          userId: null,
        }),
        expect.objectContaining({
          action: 'add',
          eventId: eventTomorrow.id,
          inviteId: null,
          userId: USER_ID,
        }),
      ]);
    });

    it('leaving removes invite if not accepted', async () => {
      const inviteStart = LocalDate.now()
        .atTime(20, 0)
        .atZone(Activity.NYC_TZ)
        .withFixedOffsetZone();

      mockNow(inviteStart.toString());
      const eventTomorrow = await buildEventTomorrow();

      const {
        data: { createEventInvitation },
      } = await createEventInvite(eventTomorrow.id);

      await client.mutate({
        mutation: gql`
          mutation rsvp($input: CreateRsvpInput!) {
            removeRsvp(input: $input) {
              rsvp {
                id
                action
              }
            }
          }
        `,
        variables: { input: { eventId: eventTomorrow.id } },
      });

      const dbRsvps = await Rsvp.all({ eventId: eventTomorrow.id }).orderBy(
        'inviteId'
      );
      expect(dbRsvps).toEqual([
        expect.objectContaining({
          action: 'inviter-left',
          eventId: eventTomorrow.id,
          inviteId: createEventInvitation.invitation.id,
          userId: null,
        }),
        expect.objectContaining({
          action: 'remove',
          eventId: eventTomorrow.id,
          inviteId: null,
          userId: USER_ID,
        }),
      ]);

      const dbInvite = await Invitation.byId(
        createEventInvitation.invitation.id
      );

      expect(dbInvite.active).toBe(false);
    });

    it('leaving does not remove invite if accepted', async () => {
      const authId = uuid();
      const clientForNewUser = newUserClient(authId);
      const inviteStart = LocalDate.now()
        .atTime(20, 0)
        .atZone(Activity.NYC_TZ)
        .withFixedOffsetZone();

      mockNow(inviteStart.toString());
      const eventTomorrow = await buildEventTomorrow();

      const {
        data: { createEventInvitation },
      } = await createEventInvite(eventTomorrow.id);

      const {
        data: { createUser },
      } = await clientForNewUser.mutate({
        mutation: gql`
          mutation createUser($input: CreateUserInput!) {
            createUser(input: $input) {
              user {
                id
              }
            }
          }
        `,
        variables: {
          input: {
            email: 'a@b.com',
            firstName: 'a',
            lastName: 'b',
            birthday: '1910-10-10',
            invitationCode: createEventInvitation.invitation.code,
          },
        },
      });

      await client.mutate({
        mutation: gql`
          mutation rsvp($input: CreateRsvpInput!) {
            removeRsvp(input: $input) {
              rsvp {
                id
                action
              }
            }
          }
        `,
        variables: { input: { eventId: eventTomorrow.id } },
      });

      const dbRsvps = await Rsvp.all({ eventId: eventTomorrow.id }).orderBy(
        'inviteId'
      );
      expect(dbRsvps).toEqual([
        expect.objectContaining({
          action: 'add',
          eventId: eventTomorrow.id,
          inviteId: createEventInvitation.invitation.id,
          userId: createUser.user.id,
        }),
        expect.objectContaining({
          action: 'remove',
          eventId: eventTomorrow.id,
          inviteId: null,
          userId: USER_ID,
        }),
      ]);

      const dbInvite = await Invitation.byId(
        createEventInvitation.invitation.id
      );

      expect(dbInvite.active).toBe(false);
    });

    it('remove expired rsvps if invite not used', async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const eventTomorrow = await buildEventTomorrow();

      const {
        data: {
          createEventInvitation: { invitation },
        },
      } = await createEventInvite(eventTomorrow.id);

      mockNow(eventTomorrow.time);

      await rejectExpiredEventInvites(loaders({ currentUserId: null }));

      const dbRsvps = await Rsvp.all({ eventId: eventTomorrow.id }).orderBy(
        'inviteId'
      );

      expect(dbRsvps).toEqual([
        expect.objectContaining({
          action: 'expired',
          eventId: eventTomorrow.id,
          inviteId: invitation.id,
          userId: null,
        }),
        // Don't reject inviter's invite
        expect.objectContaining({
          action: 'add',
          eventId: eventTomorrow.id,
          inviteId: null,
          userId: USER_ID,
        }),
      ]);
    });

    it('does not remove expired rsvps if invite used', async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const eventTomorrow = await buildEventTomorrow();

      const {
        data: {
          createEventInvitation: { invitation },
        },
      } = await createEventInvite(eventTomorrow.id);
      const authId = uuid();
      const clientForNewUser = newUserClient(authId);

      const {
        data: { createUser },
      } = await clientForNewUser.mutate({
        mutation: gql`
          mutation createUser($input: CreateUserInput!) {
            createUser(input: $input) {
              user {
                id
              }
            }
          }
        `,
        variables: {
          input: {
            email: 'a@b.com',
            firstName: 'a',
            lastName: 'b',
            birthday: '1910-10-10',
            invitationCode: invitation.code,
          },
        },
      });

      mockNow(
        LocalDate.now()
          .atTime(21, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );

      await rejectExpiredEventInvites(loaders({ currentUserId: null }));

      const dbRsvps = await Rsvp.all({ eventId: eventTomorrow.id }).orderBy(
        'inviteId'
      );

      expect(dbRsvps).toEqual([
        expect.objectContaining({
          action: 'add',
          eventId: eventTomorrow.id,
          inviteId: invitation.id,
          userId: createUser.user.id,
        }),
        // Don't reject inviter's invite
        expect.objectContaining({
          action: 'add',
          eventId: eventTomorrow.id,
          inviteId: null,
          userId: USER_ID,
        }),
      ]);
    });

    it('invites are idempotent per user and event', async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const eventTomorrow = await buildEventTomorrow();

      const { data: firstInvite } = await createEventInvite(eventTomorrow.id);
      const { data: secondInvite } = await createEventInvite(eventTomorrow.id);

      expect(secondInvite).toEqual(firstInvite);
    });
  });
});
