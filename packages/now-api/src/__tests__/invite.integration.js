import gql from 'graphql-tag';
import { ZoneId, LocalDate } from 'js-joda';

import { client, USER_ID } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Rsvp } from '../db/repos';
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
          time: tomorrow.atTime(14, 0).toString(),
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

    it('create during invite hour', async () => {
      const inviteStart = LocalDate.now()
        .atTime(20, 0)
        .atZone(Activity.NYC_TZ)
        .withFixedOffsetZone();
      const inviteEnd = LocalDate.now()
        .atTime(21, 0)
        .atZone(Activity.NYC_TZ)
        .withZoneSameInstant(ZoneId.UTC)
        .withFixedOffsetZone();

      mockNow(inviteStart.toString());
      const eventTomorrow = await buildEventTomorrow();

      const results = await createEventInvite(eventTomorrow.id);

      const { data } = results;

      expect(data.createEventInvitation).toMatchObject({
        invitation: {
          __typename: 'EventInvitation',
          code: expect.stringMatching(/\d{6}/),
          expiresAt: inviteEnd.toString(),
          inviter: {
            id: USER_ID,
          },
          usedAt: null,
          event: {
            id: eventTomorrow.id,
          },
        },
      });

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

    it("can't create before invite hour", async () => {
      mockNow(
        LocalDate.now()
          .atTime(19, 0)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const eventTomorrow = await buildEventTomorrow();

      const results = createEventInvite(eventTomorrow.id);
      await expect(results).rejects.toEqual(
        new Error(`GraphQL error: Event ${eventTomorrow.id} not found`)
      );
    });

    it("can't create after invite hour", async () => {
      mockNow(
        LocalDate.now()
          .atTime(21, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const eventTomorrow = await buildEventTomorrow();

      await expect(createEventInvite(eventTomorrow.id)).rejects.toEqual(
        new Error(
          `GraphQL error: You can't invite a friend to this Meetup at this time.`
        )
      );
    });

    it('remove expired rsvps', async () => {
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
          action: 'expired',
          eventId: eventTomorrow.id,
          inviteId: invitation.id,
          userId: null,
        }),
        expect.objectContaining({
          action: 'expired',
          eventId: eventTomorrow.id,
          inviteId: null,
          userId: USER_ID,
        }),
      ]);
    });

    it("can't invite twice", async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 1)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const eventTomorrow = await buildEventTomorrow();

      await createEventInvite(eventTomorrow.id);

      await expect(createEventInvite(eventTomorrow.id)).rejects.toEqual(
        new Error(
          `GraphQL error: You're only allowed to invite one person to a Meetup.`
        )
      );
    });
  });
});
