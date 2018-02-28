import gql from 'graphql-tag';

import { mocks, mockPromise, client } from '../db/mock';

const mockDynamoMessage1 = {
  eventId: '1',
  text: 'message text',
  ts: 1519765415755,
  userId: '1',
};

const mockDynamoMessage2 = {
  eventId: '1',
  text: 'message text',
  ts: 1519765415765,
  userId: '2',
};

const mockDynamoMessage3 = {
  eventId: '1',
  text: 'message text',
  ts: 1519765415775,
  userId: '2',
};

const mockDynamoMessage4 = {
  eventId: '1',
  text: 'message text',
  ts: 1519765415785,
  userId: '2',
};

const mockDynamoMessage5 = {
  eventId: '1',
  text: 'message text',
  ts: 1519765415795,
  userId: '2',
};
mocks.query = () =>
  mockPromise([
    mockDynamoMessage1,
    mockDynamoMessage2,
    mockDynamoMessage3,
    mockDynamoMessage4,
    mockDynamoMessage5,
  ]);
mocks.get = () => mockPromise({ id: 1 });

describe('message', () => {
  it('returns eventMessages', async () => {
    const results = client.query({
      query: gql`
        {
          eventMessages(eventId: "1") {
            edges {
              node {
                event {
                  id
                }
                text
                ts
                user {
                  id
                }
              }
            }
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
  it('returns first n results', async () => {
    const results = client.query({
      query: gql`
        {
          eventMessages(eventId: "1", first: 2) {
            edges {
              node {
                event {
                  id
                }
                text
                ts
                user {
                  id
                }
              }
            }
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
  it('returns last n results', async () => {
    const results = client.query({
      query: gql`
        {
          eventMessages(eventId: "1", last: 2) {
            edges {
              node {
                event {
                  id
                }
                text
                ts
                user {
                  id
                }
              }
            }
          }
        }
      `,
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
});
