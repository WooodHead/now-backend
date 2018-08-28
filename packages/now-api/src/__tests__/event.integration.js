import gql from 'graphql-tag';
import { omit, sortBy } from 'lodash';
import uuid from 'uuid/v4';
import { LocalDate } from 'js-joda';

import { client, setAdmin, USER_ID } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { EventUserMetadata } from '../db/repos';
import { mockNow, restoreNow } from '../../testutils/date';
import * as Activity from '../schema/resolvers/Activity';
import { createRsvp } from '../schema/resolvers/Rsvp';

const activity = factory.build('activity');
const location = factory.build('location');
const events = factory.buildList('event', 5, {}, { activity, location });
const event = events[0];
event.time = '2018-05-30 20:00:00+00';
event.timezone = 'Asia/Calcutta';

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.ACTIVITIES).truncate(),
    sql(SQL_TABLES.EVENTS).truncate(),
    sql(SQL_TABLES.LOCATIONS).truncate(),
  ]);

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.ACTIVITIES).insert(activity),
      sql(SQL_TABLES.EVENTS).insert(events),
      sql(SQL_TABLES.LOCATIONS).insert(location),
    ])
  ));
afterEach(() => {
  setAdmin(false);
  return truncateTables();
});

describe('Event', () => {
  it('return allEvents', async () => {
    setAdmin(true);
    const results = client.query({
      query: gql`
        {
          allEvents {
            edges {
              node {
                id
                limit
                activity {
                  id
                  activityDate
                  title
                  description
                  createdAt
                  updatedAt
                }
                rsvps {
                  edges {
                    node {
                      event {
                        id
                      }
                      updatedAt
                    }
                  }
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      `,
    });
    const { data } = await results;
    expect(data.allEvents).toMatchObject({
      edges: expect.arrayContaining(
        events.map(e =>
          expect.objectContaining({
            __typename: 'RootEventsEdge',
            [Symbol('id')]: expect.anything(),
            node: expect.objectContaining({
              __typename: 'Event',
              ...omit(e, [
                'locationId',
                'activityId',
                'timezone',
                'duration',
                'visibleAt',
                'time',
                'going',
              ]),
            }),
          })
        )
      ),
    });
  });

  describe('events visible to user', () => {
    let eventToday;
    let eventTomorrow;
    let eventLastWeek;
    beforeEach(async () => {
      await sql(SQL_TABLES.EVENTS).truncate();
      const today = LocalDate.now();
      eventToday = factory.build(
        'event',
        {
          time: today.atTime(14, 0).toString(),
          timezone: Activity.NYC_TZ.id(),
          visibleAt: today
            .minusDays(1)
            .atTime(14, 0)
            .toString(),
        },
        { activity, location }
      );
      eventTomorrow = factory.build(
        'event',
        {
          time: today
            .plusDays(1)
            .atTime(14, 0)
            .toString(),
          timezone: Activity.NYC_TZ.id(),
          visibleAt: today.atTime(14, 0).toString(),
        },
        { activity, location }
      );
      eventLastWeek = factory.build(
        'event',
        {
          time: today
            .minusDays(7)
            .atTime(14, 0)
            .toString(),
          timezone: Activity.NYC_TZ.id(),
          visibleAt: today
            .minusDays(8)
            .atTime(14, 0)
            .toString(),
        },
        { activity, location }
      );
      const eventNotPublished = factory.build(
        'event',
        {
          time: today.atTime(14, 0).toString(),
          timezone: Activity.NYC_TZ.id(),
          visibleAt: null,
        },
        { activity, location }
      );
      await sql(SQL_TABLES.EVENTS).insert([
        eventLastWeek,
        eventToday,
        eventTomorrow,
        eventNotPublished,
      ]);
    });
    afterEach(() => {
      restoreNow();
      return sql(SQL_TABLES.EVENTS).truncate();
    });
    it('before early availability', async () => {
      mockNow(
        LocalDate.now()
          .atTime(14, 0)
          .toString()
      );
      const results = client.query({
        fetchPolicy: 'network-only',
        query: gql`
          {
            events {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      });

      const { data } = await results;

      expect(data.events.edges.map(({ node }) => node.id)).toEqual([
        eventToday.id,
        eventTomorrow.id,
      ]);
    });
    it('after early availability', async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 0)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const results = client.query({
        fetchPolicy: 'network-only',
        query: gql`
          {
            events {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      });
      const { data } = await results;

      expect(data.events.edges.map(({ node }) => node.id)).toEqual([
        eventToday.id,
        eventTomorrow.id,
      ]);
    });
    it('includePast', async () => {
      mockNow(
        LocalDate.now()
          .atTime(20, 0)
          .atZone(Activity.NYC_TZ)
          .withFixedOffsetZone()
          .toString()
      );
      const results = client.query({
        fetchPolicy: 'network-only',
        query: gql`
          query getEvents($includePast: Boolean) {
            events(includePast: $includePast) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        variables: {
          includePast: true,
        },
      });
      const { data } = await results;

      expect(data.events.edges.map(({ node }) => node.id)).toEqual([
        eventLastWeek.id,
        eventToday.id,
        eventTomorrow.id,
      ]);
    });
  });

  it('return event', async () => {
    const results = await client.query({
      query: gql`
        query getEvent($id: ID!) {
          event(id: $id) {
            id
            limit
            activity {
              id
              title
              emoji
              activityDate
              description
            }
            location {
              id
              foursquareVenueId
              lat
              lng
              address
              name
              crossStreet
              city
              state
              postalCode
              country
              neighborhood
            }
            rsvps {
              edges {
                node {
                  event {
                    id
                  }
                  updatedAt
                }
              }
            }
          }
        }
      `,
      variables: { id: event.id },
    });
    const { data } = results;
    expect(data).toMatchObject({
      event: {
        __typename: 'Event',
        ...omit(event, [
          'locationId',
          'activityId',
          'timezone',
          'duration',
          'visibleAt',
          'time',
          'going',
        ]),
        activity,
      },
    });
  });

  it('deals with time', async () => {
    const { id } = event;
    const result = await client.query({
      query: gql`
        query getEventTime($id: ID!) {
          event(id: $id) {
            id
            time
          }
        }
      `,
      variables: { id },
    });
    const foundTime = result.data.event.time;
    expect(foundTime).toEqual('2018-05-31T01:30+05:30');
  });

  describe('message counting', () => {
    afterEach(() =>
      Promise.all([
        sql(SQL_TABLES.EVENT_USER_METADATA).truncate(),
        sql(SQL_TABLES.MESSAGES).truncate(),
      ]));
    it('defaults to 0', async () => {
      const results = await client.query({
        query: gql`
          query getEvent($id: ID!) {
            event(id: $id) {
              id
              messages {
                count
                unreadCount
              }
            }
            unreadMessagesCount
          }
        `,
        variables: { id: event.id },
        fetchPolicy: 'network-only',
      });
      const { data } = results;
      expect(data.event.messages).toMatchObject({
        unreadCount: 0,
        count: 0,
      });
      expect(data.unreadMessagesCount).toEqual(0);
    });
    it('unread matches count when no row created', async () => {
      const messages = factory.buildList(
        'message',
        10,
        {},
        { event, user: { id: USER_ID } }
      );
      await sql(SQL_TABLES.MESSAGES).insert(messages);
      const results = await client.query({
        query: gql`
          query getEvent($id: ID!) {
            event(id: $id) {
              id
              messages {
                count
                unreadCount
              }
            }
            unreadMessagesCount
          }
        `,
        variables: {
          id: event.id,
        },
        fetchPolicy: 'network-only',
      });
      const { data } = results;
      expect(data.event.messages).toMatchObject({
        unreadCount: 10,
        count: 10,
      });
      expect(data.unreadMessagesCount).toEqual(0);
    });
    it('unread matches count when RSVP', async () => {
      await sql.transaction(trx =>
        createRsvp(
          trx,
          { userId: USER_ID, eventId: event.id, ignoreVisible: true },
          'add'
        )
      );
      const messages = factory.buildList(
        'message',
        10,
        {},
        { event, user: { id: USER_ID } }
      );
      await sql(SQL_TABLES.MESSAGES).insert(messages);
      const { data } = await client.query({
        query: gql`
          query unreadMessagesCount {
            unreadMessagesCount
          }
        `,
        fetchPolicy: 'network-only',
      });
      expect(data.unreadMessagesCount).toEqual(10);
    });
    it('unread correct when marked read', async () => {
      const messages = factory.buildList(
        'message',
        10,
        {},
        { event, user: { id: USER_ID } }
      );
      await sql(SQL_TABLES.MESSAGES).insert(messages);

      const sortedMessages = sortBy(messages, 'ts');
      const unreadTs = sortedMessages[3].ts;

      await sql(SQL_TABLES.EVENT_USER_METADATA).insert({
        id: uuid(),
        lastReadTs: unreadTs,
        eventId: event.id,
        userId: USER_ID,
      });

      const results = await client.query({
        query: gql`
          query getEvent($id: ID!) {
            event(id: $id) {
              id
              messages {
                count
                unreadCount
              }
            }
          }
        `,
        variables: {
          id: event.id,
        },
        fetchPolicy: 'network-only',
      });
      const { data } = results;
      expect(data.event.messages).toMatchObject({
        unreadCount: 6,
        count: 10,
      });
    });
  });

  describe('markEventChatRead', () => {
    it('inserts new read time', async () => {
      const results = await client.mutate({
        mutation: gql`
          mutation mark($input: MarkEventChatReadInput!) {
            markEventChatRead(input: $input) {
              event {
                id
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, ts: '123456' } },
      });
      const { data } = results;
      expect(data).toMatchObject({
        markEventChatRead: {
          __typename: 'MarkEventChatReadPayload',
          event: {
            __typename: 'Event',
            id: event.id,
          },
        },
      });

      const dbMetadata = await EventUserMetadata.get({
        eventId: event.id,
        userId: USER_ID,
      });

      expect(dbMetadata).toMatchObject({
        userId: USER_ID,
        eventId: event.id,
        lastReadTs: '123456',
      });
    });

    it('requires ts as number', async () => {
      const results = client.mutate({
        mutation: gql`
          mutation mark($input: MarkEventChatReadInput!) {
            markEventChatRead(input: $input) {
              event {
                id
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, ts: 'not a number' } },
        errorPolicy: 'none',
      });

      expect.assertions(1);
      return expect(results).rejects.toEqual(
        new Error('GraphQL error: ts must be an integer as a string')
      );
    });

    it('updates existing read time', async () => {
      await client.mutate({
        mutation: gql`
          mutation mark($input: MarkEventChatReadInput!) {
            markEventChatRead(input: $input) {
              event {
                id
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, ts: '123456' } },
      });
      const results = await client.mutate({
        mutation: gql`
          mutation mark($input: MarkEventChatReadInput!) {
            markEventChatRead(input: $input) {
              event {
                id
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, ts: '654321' } },
      });
      const { data } = results;
      expect(data).toMatchObject({
        markEventChatRead: {
          __typename: 'MarkEventChatReadPayload',
          event: {
            __typename: 'Event',
            id: event.id,
          },
        },
      });

      const dbMetadata = await EventUserMetadata.get({
        eventId: event.id,
        userId: USER_ID,
      });

      expect(dbMetadata).toMatchObject({
        userId: USER_ID,
        eventId: event.id,
        lastReadTs: '654321',
      });
    });
  });
});
