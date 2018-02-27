import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';

const mockDynamoTemplate = {
  id: 'fa7a48e0-1043-11e8-b919-8f03cfc03e44',
  title: 'My Great Activity',
  description: 'We are going to do something really great!',
  duration: 120,
  updatedAt: '2018-02-26T19:44:34.778Z',
  createdAt: '2018-02-26T19:44:34.778Z',
};

describe('template', () => {
  it('return allTemplates', async () => {
    mocks.scan = table => {
      switch (table) {
        case 'now_template':
          return mockPromise([mockDynamoTemplate]);
        default:
          return null;
      }
    };
    const results = client.query({
      query: gql`
        {
          allActivityTemplates {
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

  it('gets single template', async () => {
    mocks.get = (table, key) => {
      if (
        table === 'now_template' &&
        key.id === 'fa7a48e0-1043-11e8-b919-8f03cfc03e44'
      ) {
        return mockPromise(mockDynamoTemplate);
      }
      throw new Error(`Unknown table: ${table}, key: ${key}`, key);
    };

    const res = client.query({
      query: gql`
        {
          template(id: "fa7a48e0-1043-11e8-b919-8f03cfc03e44") {
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
