import gql from 'graphql-tag';
import { omit } from 'lodash';

import { client } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';

const activity = factory.build('activity');
const location = factory.build('location');
const events = factory.buildList('event', 5, {}, { activity, location });
events[0].time = '2018-05-30 20:00:00+00';
events[0].timezone = 'Asia/Calcutta';

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
            ...omit(e, ['locationId', 'activityId', 'timezone', 'time']),
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
      variables: { id: events[0].id },
    });
    const { data } = results;
    expect(data).toMatchObject({
      event: {
        __typename: 'Event',
        ...omit(events[0], ['locationId', 'activityId', 'timezone', 'time']),
        activity,
      },
    });
  });

  it('deals with time', async () => {
    const { id } = events[0];
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
});
