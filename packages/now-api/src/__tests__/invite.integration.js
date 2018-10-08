import gql from 'graphql-tag';
import { LocalDate, LocalDateTime, ZoneId } from 'js-joda';
import uuid from 'uuid/v4';

import { client, USER_ID } from '../db/mock';
import { SQL_TABLES, GLOBAL_COMMUNITY_ID } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Invitation } from '../db/repos';
import { mockNow, restoreNow } from '../../testutils/date';
import * as Activity from '../schema/resolvers/Activity';

const location = factory.build('location');
const user = factory.build('user', { id: USER_ID });
const membership = {
  id: uuid(),
  userId: USER_ID,
  communityId: GLOBAL_COMMUNITY_ID,
};

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
    sql(SQL_TABLES.MEMBERSHIPS).truncate(),
  ]);

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.LOCATIONS).insert(location),
      sql(SQL_TABLES.USERS).insert(user),
      sql(SQL_TABLES.MEMBERSHIPS).insert(membership),
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
