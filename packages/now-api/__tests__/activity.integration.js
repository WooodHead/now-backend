import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';
import { TABLES } from '../db/constants';

const mockDynamoActivity = {
  id: 'fa7a48e0-1043-11e8-b919-8f03cfc03e44',
  title: 'My Great Activity',
  description: 'We are going to do something really great!',
  duration: 120,
  updatedAt: '2018-02-26T19:44:34.778Z',
  createdAt: '2018-02-26T19:44:34.778Z',
};

describe('activity', () => {
  it('return allActivities', async () => {
    mocks.scan = table => {
      switch (table) {
        case TABLES.ACTIVITY:
          return mockPromise([mockDynamoActivity]);
        default:
          return null;
      }
    };
    const results = client.query({
      query: gql`
        {
          allActivities {
            id
            title
            description
            duration
            createdAt
            updatedAt
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });

  it('gets single activity', async () => {
    mocks.getActivity = key => {
      if (key === 'fa7a48e0-1043-11e8-b919-8f03cfc03e44') {
        return mockPromise(mockDynamoActivity);
      }
      throw new Error(`Unknown key: ${key}`, key);
    };

    const res = client.query({
      query: gql`
        {
          activity(id: "fa7a48e0-1043-11e8-b919-8f03cfc03e44") {
            id
            title
            description
            duration
            createdAt
            updatedAt
          }
        }
      `,
    });

    const { data } = await res;
    expect(data).toMatchSnapshot();
  });
});
