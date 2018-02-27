import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';

const mockDynamoEvent = {
  limit: 10,
  post_channel: 'x',
  slug: 'med',
  createdAt: 1518474478805,
  time: 1548918000000,
  inorout: { y: 'in', z: 'in' },
  creator_id: 'z',
  channel_id: 'y',
  updatedAt: 1518531077115,
  description:
    "The workday can get hectic, so take a few minutes to recenter yourself with a short (guided?) meditation. It's only 30 mins long, but the effects will last all day. Namaste.",
  id: 'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
  duration: 30,
  title: 'Take a Meditation Break',
};

const mockDynamoActivity = {
  id: 'meditation',
  slug: 'med',
  description:
    "The workday can get hectic, so take a few minutes to recenter yourself with a short (guided?) meditation. It's only 30 mins long, but the effects will last all day. Namaste.",
  duration: 30,
  title: 'Take a Meditation Break',
  limit: 10,
  updatedAt: 1518531077115,
  createdAt: 1518531077115,
};

describe('botEvent', () => {
  it('return allBotEvents', async () => {
    mocks.scan = table => {
      switch (table) {
        case 'now':
          return mockPromise([mockDynamoEvent]);
        case 'now_table':
          return mockPromise([mockDynamoActivity]);
        default:
          return null;
      }
    };
    mocks.get = (table, key) => {
      if (
        table === 'now' &&
        key.id === 'fa8a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoEvent);
      }
      throw new Error(`Unknown table: ${table}, key: ${key}`, key);
    };

    const results = client.query({
      query: gql`
        {
          allBotEvents {
            id
            title
            attendeeCount
            chatChannel
            postChannel
            description
            limit
            slug
            title
            duration
            creator
            activity {
              id
              title
              slug
              description
              duration
              createdAt
              updatedAt
            }
            attendees
            reminders {
              type
              sent
            }
            time
            createdAt
            updatedAt
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });

  it('return bot event', async () => {
    mocks.scan = table => {
      switch (table) {
        case 'now_table':
          return mockPromise([mockDynamoActivity]);
        default:
          return null;
      }
    };
    mocks.get = (table, key) => {
      if (
        table === 'now' &&
        key.id === 'fa8a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoEvent);
      }
      throw new Error(`Unknown table: ${table}, key: ${key}`, key);
    };

    const results = client.query({
      query: gql`
        {
          botEvent(id: "fa8a48e0-1043-11e8-b919-8f03cfc03e44") {
            id
            title
            attendeeCount
            chatChannel
            postChannel
            description
            limit
            slug
            title
            duration
            creator
            activity {
              id
              title
              slug
              description
              duration
              createdAt
              updatedAt
            }
            attendees
            reminders {
              type
              sent
            }
            time
            createdAt
            updatedAt
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
});
