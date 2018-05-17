import gql from 'graphql-tag';
import { omit } from 'lodash';

import { mocks, mockPromise, client } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';

const activity = factory.build('activity');
const location = factory.build('location');
const events = factory.buildList('event', 5, {}, { activity, location });

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
  )
);
afterAll(() => truncateTables());

const mockDynamoRsvp1 = {
  id: '1',
  userId: '1',
  action: 'add',
  eventId: 'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
  createdAt: '2018-02-26T19:44:34.778Z',
  updatedAt: '2018-02-27T19:44:34.778Z',
};

const mockDynamoRsvp2 = {
  id: '2',
  userId: '1',
  action: 'add',
  eventId: 'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
  createdAt: '2018-02-26T19:44:34.778Z',
  updatedAt: '2018-02-27T19:44:34.778Z',
};
mocks.query = () => mockPromise([mockDynamoRsvp1, mockDynamoRsvp2]);
mocks.queryRaw = () =>
  mockPromise({ ScannedCount: 2, Items: [mockDynamoRsvp1, mockDynamoRsvp2] });

describe('Event', () => {
  it('return allEvents', async () => {
    const results = client.query({
      query: gql`
        {
          allEvents {
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
            time
            createdAt
            updatedAt
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchObject({
      allEvents: expect.arrayContaining(
        events.map(e =>
          expect.objectContaining({
            __typename: 'Event',
            ...omit(e, ['locationId', 'activityId']),
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
            time
          }
        }
      `,
      variables: { id: events[0].id },
    });
    const { data } = results;
    expect(data).toMatchObject({
      event: {
        __typename: 'Event',
        ...omit(events[0], ['locationId', 'activityId']),
        activity,
      },
    });
  });
});
