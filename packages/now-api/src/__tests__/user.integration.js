import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';

const mockDynamoUser = {
  id: '88cd90f0-3e96-11e8-8c8e-99193c2f37fb',
  auth0Id: 'what|ever',
  firstName: 'Jane',
  lastName: 'Tester',
  createdAt: '2018-02-26T19:44:34.778Z',
  updatedAt: '2018-02-26T19:44:34.778Z',
  location: 'New York, NY',
  bio: 'I am a test user.',
};

mocks.loadMember.mockReturnValueOnce(mockPromise(mockDynamoUser));

describe('user', () => {
  it('returns the current user', async () => {
    const results = client.query({
      query: gql`
        {
          user(id: "88cd90f0-3e96-11e8-8c8e-99193c2f37fb") {
            id
            firstName
            lastName
            bio
            createdAt
            updatedAt
            location
          }
        }
      `,
    });

    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
});
