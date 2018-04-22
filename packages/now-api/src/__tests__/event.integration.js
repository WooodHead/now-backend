import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';
import { TABLES } from '../db/constants';

const mockDynamoEvent = {
  id: 'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
  activityId: 'fa7a48e0-1043-11e8-b919-8f03cfc03e44',
  limit: 10,
  createdAt: '2018-02-26T19:44:34.778Z',
  time: '2018-02-27T19:44:34.778Z',
  rsvps: [],
  updatedAt: '2018-02-26T19:44:34.778Z',
};

const mockDynamoActivity = {
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
mocks.queryRaw = () =>
  mockPromise({ ScannedCount: 2, Items: [mockDynamoRsvp1, mockDynamoRsvp2] });

mocks.scan = table => {
  switch (table) {
    case TABLES.EVENT:
      return mockPromise([mockDynamoEvent]);
    default:
      return null;
  }
};
mocks.getActivity = id => {
  if (id === 'fa7a48e0-1043-11e8-b919-8f03cfc03e44') {
    return mockPromise(mockDynamoActivity);
  }
  throw Error(`activity ${id} not found`);
};
mocks.getEvent = () => mockPromise(mockDynamoEvent);

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
