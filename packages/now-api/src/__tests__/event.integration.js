import gql from 'graphql-tag';
import { omit, sortBy } from 'lodash';
import uuid from 'uuid/v4';

import { client, setAdmin, USER_ID } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { EventUserMetadata } from '../db/repos';

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

beforeAll(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.ACTIVITIES).insert(activity),
      sql(SQL_TABLES.EVENTS).insert(events),
      sql(SQL_TABLES.LOCATIONS).insert(location),
    ])
  ));
afterAll(() => {
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
              ...omit(e, ['locationId', 'activityId', 'timezone', 'time']),
            }),
          })
        )
      ),
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
        ...omit(event, ['locationId', 'activityId', 'timezone', 'time']),
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

      const dbRsvp = await EventUserMetadata.get({
        eventId: event.id,
        userId: USER_ID,
      });

      expect(dbRsvp).toMatchObject({
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

      const dbRsvp = await EventUserMetadata.get({
        eventId: event.id,
        userId: USER_ID,
      });

      expect(dbRsvp).toMatchObject({
        userId: USER_ID,
        eventId: event.id,
        lastReadTs: '654321',
      });
    });
  });
});
