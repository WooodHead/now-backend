import gql from 'graphql-tag';
import { use as jsJodaUse } from 'js-joda';
import jsJodaTimezone from 'js-joda-timezone';

import { client } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Activity } from '../db/repos';

jsJodaUse(jsJodaTimezone);
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
  )
);
afterAll(() => truncateTables());

describe('activity', () => {
  it('return allActivities', async () => {
    const results = client.query({
      query: gql`
        {
          allActivities {
            id
            title
            emoji
            description
            activityDate
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toHaveProperty('allActivities');

    expect(data.allActivities).toHaveLength(4);
    expect(data.allActivities).toEqual(
      expect.arrayContaining(
        [...activities, todayActivity].map(a =>
          expect.objectContaining({
            __typename: 'Activity',
            [Symbol('id')]: `Activity:${a.id}`,
            id: a.id,
            activityDate: a.activityDate,
            description: a.description,
            emoji: a.emoji,
            title: a.title,
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

    const { data: { createActivity: { activity: { id } } } } = res;

    const dbActivity = await Activity.byId(id);
    dbActivity.activityDate = dbActivity.activityDate.toISOString();

    expect(dbActivity).toMatchObject({
      id,
      title,
      description,
      activityDate: expect.stringContaining(activityDate),
      emoji,
    });
  });
});
