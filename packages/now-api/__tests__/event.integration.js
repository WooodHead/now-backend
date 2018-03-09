import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';

const mockDynamoEvent = {
  id: 'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
  templateId: 'fa7a48e0-1043-11e8-b919-8f03cfc03e44',
  limit: 10,
  createdAt: '2018-02-26T19:44:34.778Z',
  time: '2018-02-27T19:44:34.778Z',
  rsvps: [],
  updatedAt: '2018-02-26T19:44:34.778Z',
};

const mockDynamoTemplate = {
  id: 'fa7a48e0-1043-11e8-b919-8f03cfc03e44',
  title: 'My Great Activity',
  description: 'We are going to do something really great!',
  duration: 120,
  updatedAt: '2018-02-26T19:44:34.778Z',
  createdAt: '2018-02-26T19:44:34.778Z',
};

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

describe('Event', () => {
  it('return allEvents', async () => {
    mocks.scan = table => {
      switch (table) {
        case 'now_event':
          return mockPromise([mockDynamoEvent]);
        default:
          return null;
      }
    };
    mocks.get = (table, key) => {
      if (
        table === 'now_event' &&
        key.id === 'fa8a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoEvent);
      }
      if (
        table === 'now_template' &&
        key.id === 'fa7a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoTemplate);
      }
      throw new Error(`Unknown table: ${table}, key: ${key}`, key);
    };

    const results = client.query({
      query: gql`
        {
          allEvents {
            id
            limit
            activity {
              id
              title
              description
              duration
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
    expect(data).toMatchSnapshot();
  });

  it('return event', async () => {
    mocks.get = (table, key) => {
      if (
        table === 'now_event' &&
        key.id === 'fa8a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoEvent);
      }
      if (
        table === 'now_template' &&
        key.id === 'fa7a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoTemplate);
      }
      throw new Error(`Unknown table: ${table}, key: ${key.id}`, key);
    };

    const results = client.query({
      query: gql`
        {
          event(id: "fa8a48e0-1043-11e8-b919-8f03cfc03e44") {
            id
            limit
            activity {
              id
              title
              description
              duration
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
    expect(data).toMatchSnapshot();
  });
});
