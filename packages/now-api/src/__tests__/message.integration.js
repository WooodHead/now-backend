import gql from 'graphql-tag';
import uuid from 'uuid/v4';

import { client, USER_ID, subClient } from '../db/mock';
import factory from '../db/factory';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import chat from '../fcm/chat';
import { Message, Rsvp } from '../db/repos';

jest.mock('../fcm/chat', () => jest.fn());

const event = factory.build('event', {
  id: '516f21b1-aff8-4ae0-be1f-e99b415f3652',
});

const user1 = factory.build('user', {
  id: USER_ID,
});

const user2 = factory.build('user', {
  id: 'e5380f3c-57c8-11e8-b397-7be415c41792',
});

const rsvp1 = factory.build('rsvp', {}, { event, user: user1 });

const rsvp2 = factory.build('rsvp', {}, { event, user: user2 });

const message1 = {
  id: uuid(),
  eventId: event.id,
  text: 'message text 1',
  ts: 1519765415755,
  userId: user1.id,
};

const message2 = {
  id: uuid(),
  eventId: event.id,
  text: 'message text 2',
  ts: 1519765415765,
  userId: user2.id,
};

const message3 = {
  id: uuid(),
  eventId: event.id,
  text: 'message text 3',
  ts: 1519765415775,
  userId: user2.id,
};

const message4 = {
  id: uuid(),
  eventId: event.id,
  text: 'message text 4',
  ts: 1519765415785,
  userId: user2.id,
};

const message5 = {
  id: uuid(),
  eventId: event.id,
  text: 'message text 5',
  ts: 1519765415795,
  userId: user2.id,
};

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.EVENTS).truncate(),
    sql(SQL_TABLES.USERS).truncate(),
    sql(SQL_TABLES.MESSAGES).truncate(),
    sql(SQL_TABLES.RSVPS).truncate(),
  ]);

describe('message', () => {
  beforeEach(() =>
    truncateTables().then(() =>
      Promise.all([
        sql(SQL_TABLES.EVENTS).insert(event),
        sql(SQL_TABLES.USERS).insert([user1, user2]),
        sql(SQL_TABLES.RSVPS).insert([rsvp1, rsvp2]),
        sql(SQL_TABLES.MESSAGES).insert([
          message1,
          message2,
          message3,
          message4,
          message5,
        ]),
      ])
    ));
  afterEach(() => truncateTables());
  it('returns eventMessages', async () => {
    const results = client.query({
      query: gql`
        query getEvent($id: ID!) {
          event(id: $id) {
            messages {
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
        }
      `,
      variables: { id: event.id },
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
  it('returns first n results', async () => {
    const results = client.query({
      query: gql`
        query getEvent($id: ID!) {
          event(id: $id) {
            messages(first: 2) {
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
        }
      `,
      variables: { id: event.id },
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
  it('returns last n results', async () => {
    const results = client.query({
      query: gql`
        query getEvent($id: ID!) {
          event(id: $id) {
            messages(last: 2) {
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
        }
      `,
      variables: { id: event.id },
    });
    const { data } = await results;
    expect(data).toMatchSnapshot();
  });
  describe('createMessage', () => {
    it('send message', async done => {
      const sub = subClient();
      sub
        .subscribe({
          query: gql`
            subscription {
              unreadMessagesCount
            }
          `,
        })
        .subscribe({
          next: ({ data }) => {
            // the 5 messages inserted at top, + the one inserted below
            expect(data.unreadMessagesCount).toEqual(6);
            done();
          },
        });

      const results = await sub.mutate({
        mutation: gql`
          mutation message($input: CreateMessageInput!) {
            createMessage(input: $input) {
              edge {
                node {
                  id
                  text
                  ts
                }
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, text: 'new message' } },
      });
      const { data } = results;
      expect(data).toMatchObject({
        createMessage: {
          __typename: 'CreateMessagePayload',
          edge: {
            __typename: 'EventMessagesEdge',
            node: {
              __typename: 'Message',
              id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
              ),
            },
          },
        },
      });

      const { id, ts } = data.createMessage.edge.node;
      expect(chat).toBeCalledWith(
        expect.objectContaining({
          eventId: event.id,
          id,
          text: 'new message',
          ts: Number(ts),
          userId: USER_ID,
        })
      );

      const dbMessage = await Message.byId(id);
      expect(dbMessage).toMatchObject({
        eventId: event.id,
        id,
        text: 'new message',
        ts,
        userId: USER_ID,
      });
    });

    it('requires rsvp', async () => {
      await Rsvp.delete({ id: rsvp1.id });
      const results = client.mutate({
        mutation: gql`
          mutation message($input: CreateMessageInput!) {
            createMessage(input: $input) {
              edge {
                node {
                  id
                  text
                  ts
                }
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, text: 'new message' } },
      });

      expect.assertions(1);
      return expect(results).rejects.toEqual(
        new Error(
          'GraphQL error: You must have RSVPed before you can post a message.'
        )
      );
    });
  });
});
