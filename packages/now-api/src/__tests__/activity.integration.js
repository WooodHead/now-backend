import gql from 'graphql-tag';

import { client, setAdmin } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Activity } from '../db/repos';

const activities = factory.buildList('activity', 3);
const todayActivity = factory.build('todayActivity');
const event = factory.build('event', {}, { activity: todayActivity });

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.ACTIVITIES).truncate(),
    sql(SQL_TABLES.EVENTS).truncate(),
  ]);

beforeAll(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.ACTIVITIES).insert([...activities, todayActivity]),
      sql(SQL_TABLES.EVENTS).insert(event),
    ])
  ));
afterAll(() => {
  setAdmin(false);
  return truncateTables();
});

const ALL_ACTIVITIES_QUERY = gql`
  {
    allActivities {
      edges {
        node {
          id
          title
          description
          activityDate
          emoji
        }
      }
    }
  }
`;

describe('activity', () => {
  it("won't do allActivities by default", async () => {
    const results = client.query({ query: ALL_ACTIVITIES_QUERY });
    expect.assertions(1);
    return expect(results).rejects.toEqual(
      new Error('GraphQL error: You must be an admin.')
    );
  });

  it('return allActivities when admin', async () => {
    setAdmin(true);
    const results = client.query({
      query: ALL_ACTIVITIES_QUERY,
    });
    const { data } = await results;
    expect(data).toHaveProperty('allActivities');

    expect(data.allActivities.edges).toHaveLength(4);
    expect(data.allActivities.edges).toEqual(
      expect.arrayContaining(
        [...activities, todayActivity].map(a =>
          expect.objectContaining({
            __typename: 'RootActivitiesEdge',
            [Symbol('id')]: expect.anything(),
            node: expect.objectContaining({
              __typename: 'Activity',
              [Symbol('id')]: `Activity:${a.id}`,
              id: a.id,
              activityDate: a.activityDate,
              description: a.description,
              emoji: a.emoji,
              title: a.title,
            }),
          })
        )
      )
    );
  });

  it('gets single activity', async () => {
    const res = client.query({
      query: gql`
        query getActivity($id: ID!) {
          activity(id: $id) {
            id
            title
            emoji
            description
            activityDate
          }
        }
      `,
      variables: { id: activities[0].id },
    });

    const { data } = await res;
    expect(data).toMatchObject({
      activity: {
        __typename: 'Activity',
        [Symbol('id')]: `Activity:${activities[0].id}`,
        ...activities[0],
      },
    });
  });

  it("gets today's activity", async () => {
    const res = client.query({
      query: gql`
        {
          serverMessages {
            noActivityTitle
            noActivityMessage
          }
          todayActivity {
            id
            title
            emoji
            description
            activityDate
            events {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
    });

    const { data } = await res;
    expect(data).toMatchObject({
      serverMessages: {
        noActivityTitle: 'Sorry, no Meetup today!',
        noActivityMessage:
          "We're either on vacay or planning something extra special for you.",
      },
      todayActivity: {
        __typename: 'Activity',
        [Symbol('id')]: `Activity:${todayActivity.id}`,
        ...todayActivity,
        events: {
          edges: expect.arrayContaining([
            expect.objectContaining({
              __typename: 'ActivityEventsEdge',
              [Symbol('id')]: `$Activity:${todayActivity.id}.events.edges.0`,
              node: expect.objectContaining({
                __typename: 'Event',
                id: event.id,
                [Symbol('id')]: `Event:${event.id}`,
              }),
            }),
          ]),
        },
      },
    });
  });

  it('creates an activity', async () => {
    const activity = factory.build('activity');
    const { title, description, activityDate, emoji } = activity;

    const res = await client.mutate({
      mutation: gql`
        mutation create($input: CreateActivityInput) {
          createActivity(input: $input) {
            activity {
              id
            }
          }
        }
      `,
      variables: {
        input: {
          title,
          description,
          activityDate,
          emoji,
        },
      },
    });

    const {
      data: {
        createActivity: {
          activity: { id },
        },
      },
    } = res;

    const dbActivity = await Activity.byId(id);
    dbActivity.activityDate = dbActivity.activityDate.toString();

    expect(dbActivity).toMatchObject({
      id,
      title,
      description,
      activityDate: expect.stringContaining(activityDate),
      emoji,
    });
  });
});
