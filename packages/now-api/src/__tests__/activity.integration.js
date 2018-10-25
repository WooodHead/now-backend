import gql from 'graphql-tag';
import fs from 'fs';
import { pick } from 'lodash';

import { client, setAdmin } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Activity } from '../db/repos';

const activities = factory.buildList('activity', 3);
const serverMessages = ['noActivityTitle', 'noActivityMessage'].map(key =>
  factory.build('serverMessage', { key })
);

jest.mock('../s3', () => ({
  s3: {
    putObject: () => ({
      promise: () => Promise.resolve(),
    }),
  },
}));

const MACOS_PHOTO =
  'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUAAgMGAQf/xAAxEAACAQMCBAQFAgcAAAAAAAABAgMABBEFIRITMUEGImGBFEJRcbEyoRVikaLB0fD/xAAZAQEBAQADAAAAAAAAAAAAAAADBAIAAQX/xAAiEQACAgEEAQUAAAAAAAAAAAABAgARAwQSEyExFEFRYcH/2gAMAwEAAhEDEQA/AC5fET3Mhh0y1edxtkLxY+/Ye5qieHdY1HmXk7RRyAYwCC3oOI+VfYGukt7QsBDawgKvyooVV/wKXXuu6fp2oT6XqFtJMsTqJOHDKW64x9BkffFcydCybm8YLGlEHsdIt7GVnaJzcKApklHmyOuM9KOLH6UuXxNp93fyxFpY24zlpFwOvf6UwKl8hMbDLMRsBWt6Ktzrhys+2uzD7aXT4oJC3FJMg4yTsMDrw/alEt3LLMsvLRI5WwqDOR/ull58TfXZW0naK3TJdx84Gx9u39acWVr/ABCxZAzC4j+XHQj79c1E+Rr3LPSxaZKKv3+SvNKsVYEEdR9KsJxisG86YlblvEAM4/V6e1DhywyD6VRhzDIPuRanTHCbHiaXvjTUdIkntNNtopZmkCh5UL42wTgEbDeuV1u5lvbgm5uofjrt+J+HyqNuoraZpZZLh7i4ljlRvO0cOc5HXHbahLW2tlnD20bmRxh7q8OFGeg3H4oy19yzHjVaqUnt47W2500io5bIYSZ2xjB/78138NuLbw/AkJZE4QvFnOx2J/O9fOp9OsbCRru6niuZpMlQmSrb9QOmNiNqe+FNZ1qfhtlWGWFg5QTr0Uds++aJ1sR1ejHdxpfxV+FtQghdkBaNscCr1UDpvtRGo3L2Uym0YNcKp4kAzxfyjHeqS6pqbmO1CQ24aQRs4weHIJyD6kY3+tZ6Np0trqt1dTXHNCjaQkgYxuB+9FRHcUG7Agja7DqEIV9OuOepIaMwkEHuc96KtbXmQCQFgH3x3H39a00wCN7u4lyIEJ87bAkEggftRmlqBZ8RUgOxZQew7U2ADfJNZfH595y9vyJfFDW8sZMU0HCm+N13zt06GnU3hyxu4wsgnIyDvMzDbpscipUpcdFZJnZg/RlLvwzFcoAHjLKMBpIhn+3Fe2fh+O1n+Ie5d5lTgjKjhWMeg7+9SpSbRD5snzN5bXnMVuLUTAjHEsvCCOu4NaNZajcW/JieG0iB/QAWJHqalSi41i+pyV5mqaNJIy/GXHNRdxCicEY9qaLbbVKlaWgOoLuzm2M//9k=';

const LINUX_PHOTO =
  'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUAAgMGAQf/xAAxEAACAQMCBAQFAgcAAAAAAAABAgMABBEFIRITMUEGImGBFEJRcbEyoRVikaLB0fD/xAAZAQEBAQADAAAAAAAAAAAAAAADBAIAAQX/xAAiEQACAgEEAgMBAAAAAAAAAAABAgARAwQSEyExURRBYcH/2gAMAwEAAhEDEQA/AC5fET3Mhh0y1edxtkLxY+/Ye5qieHdY1HmXk7RRyAYwCC3oOI+VfYGukt7QsBDawgKvyooVV/wKXXuu6fp2oT6XqFtJMsTqJOHDKW64x9BkffFcydCybm8YLGlEHsdIt7GVnaJzcKApklHmyOuM9KOLH6UuXxNp93fyxFpY24zlpFwOvf6UwKl8hMbDLMRsBWt6Ktzrhys+2u4fbS6fFBIW4pJkHGSdhgdeH7Uolu5ZZll5aJHK2FQZyP8AdLLz4m+uytpO0VumS7j5wNj7dv604srX+IWLIGYXEfy46EffrmonyNe5Z6WLTJRV+/5K80qxVgQR1H0qwnGKwbzpiVuW8QAzj9Xp7UOHLDIPpVGHMMg/ZFqdMcJseJpe+NNR0iSe0022ilmaQKHlQvjbBOARsN65XW7mW9uCbm6h+Ou34n4fKo26itpmllkuHuLiWOVG87Rw5zkdcdtqEtba2WcPbRuZHGHurw4UZ6DcfijLXLMeNVqpSe3jtbbnTSKjlshhJnbGMH/vzXfw24tvD8CQlkThC8Wc7HYn87186n06xsJGu7qeK5mkyVCZKtv1A6Y2I2p74U1nWp+G2VYZYWDlBOvRR2z75onWxHV6Md3Gl/FX4W1CCF2QFo2xwKvVQOm+1EajcvZTKbRg1wqniQDPF/KMd6pLqmpuY7UJDbhpBGzjB4cgnIPqRjf61no2nS2uq3V1Ncc0KNpCSBjG4H70VEdxQbsCCNrsOoQhX06456khozCQQe5z3oq1teZAJAWAffHcff1rTTAI3u7iXIgQnztsCQSCB+1GaWoFnxFSA7FlB7DtTYAN8k1l8fn7nL2/Il8UNbyxkxTQcKb43XfO3ToadTeHLG7jCyCcjIO8zMNumxyKlSmxgFZJnZg/RlLvwzFcoAHjLKMBpIhn+3Fe2fh+O1n+Ie5d5lTgjKjhWMeg7+9SpW9oh82T3N5bXnMVuLUTAjHEsvCCOu4NaNZajcW/JieG0iB/QAWJHqalSi4li/Kye5qmjSSMvxlxzUXcQonBGPami221SpWlAHiC7s5tjP/Z';

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.ACTIVITIES).truncate(),
    sql(SQL_TABLES.SERVER_MESSAGES).truncate(),
  ]);

beforeAll(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.ACTIVITIES).insert(activities),
      sql(SQL_TABLES.SERVER_MESSAGES).insert(serverMessages),
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

    expect(data.allActivities.edges).toHaveLength(3);
    expect(data.allActivities.edges).toEqual(
      expect.arrayContaining(
        activities.map(a =>
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
            generallyAvailableAt
            header {
              id
            }
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
        generallyAvailableAt: expect.stringMatching(
          /T00:00-04:00\[America\/New_York\]$/
        ),
        header: null,
      },
    });
  });

  it('creates an activity', async () => {
    const activity = factory.build('activity');
    const { title, description, activityDate, emoji } = activity;

    const file = fs.createReadStream(`${__dirname}/test_wide.png`);
    const header = Promise.resolve({ stream: file });

    const res = await client.mutate({
      mutation: gql`
        mutation create($input: CreateActivityInput) {
          createActivity(input: $input) {
            activity {
              id
              header {
                id
                preview
              }
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
          header,
        },
      },
    });

    const {
      data: {
        createActivity: {
          activity: { id, header: headerResponse },
        },
      },
    } = res;

    const dbActivity = await Activity.byId(id);
    dbActivity.activityDate = dbActivity.activityDate.toString();

    expect(dbActivity).toEqual(
      expect.objectContaining({
        id,
        title,
        description,
        activityDate: expect.stringContaining(activityDate),
        emoji,
      })
    );

    // NOTE: Upgrading sharp made the images stop working on Andy's mac, this fixes it. It shouldn't have to.
    expect(
      [MACOS_PHOTO, LINUX_PHOTO].map(preview => ({
        preview,
        __typename: 'Photo',
      }))
    ).toContainEqual(pick(headerResponse, ['preview', '__typename']));
    expect([MACOS_PHOTO, LINUX_PHOTO]).toContain(dbActivity.headerPhotoPreview);
  });
});
