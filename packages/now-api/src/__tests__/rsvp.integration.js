import gql from 'graphql-tag';
import { ZonedDateTime, ZoneId } from 'js-joda';

import { client, setAdmin, USER_ID } from '../db/mock';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import factory from '../db/factory';
import { Event, Rsvp, RsvpLog, Invitation } from '../db/repos';
import { NYC_TZ } from '../schema/resolvers/Activity';

const activity = factory.build('activity');
const location = factory.build('location');
const event = factory.build(
  'event',
  {
    limit: 5,
    time: ZonedDateTime.now(NYC_TZ)
      .plusHours(1)
      .withZoneSameInstant(ZoneId.UTC)
      .toString(),
    timezone: NYC_TZ.id(),
  },
  { activity, location }
);
const user = factory.build('user', { id: USER_ID });
const anotherUser = factory.build('user');

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.ACTIVITIES).truncate(),
    sql(SQL_TABLES.INVITATIONS).truncate(),
    sql(SQL_TABLES.INVITATION_LOG).truncate(),
    sql(SQL_TABLES.LOCATIONS).truncate(),
    sql(SQL_TABLES.EVENTS).truncate(),
    sql(SQL_TABLES.RSVPS).truncate(),
    sql(SQL_TABLES.RSVP_LOG).truncate(),
    sql(SQL_TABLES.USERS).truncate(),
  ]);

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.ACTIVITIES).insert(activity),
      sql(SQL_TABLES.EVENTS).insert(event),
      sql(SQL_TABLES.LOCATIONS).insert(location),
      sql(SQL_TABLES.USERS).insert([user, anotherUser]),
    ])
  ));
afterEach(() => truncateTables());

describe('Rsvp', () => {
  it('rsvp to event', async () => {
    const results = await client.mutate({
      mutation: gql`
        mutation rsvp($input: CreateRsvpInput!) {
          addRsvp(input: $input) {
            rsvp {
              id
              user {
                id
              }
              event {
                id
                isAttending
              }
            }
            event {
              id
            }
          }
        }
      `,
      variables: { input: { eventId: event.id } },
    });
    const { data } = results;
    expect(data).toMatchObject({
      addRsvp: {
        __typename: 'CreateRsvpPayload',
        event: {
          __typename: 'Event',
          id: event.id,
        },
        rsvp: {
          __typename: 'Rsvp',
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
          event: {
            __typename: 'Event',
            id: event.id,
            isAttending: true,
          },
          user: {
            __typename: 'User',
            id: USER_ID,
          },
        },
      },
    });

    const dbRsvp = await Rsvp.byId(data.addRsvp.rsvp.id);

    expect(dbRsvp).toMatchObject({
      id: data.addRsvp.rsvp.id,
      userId: USER_ID,
      eventId: event.id,
      action: 'add',
    });

    const dbEvent = await Event.byId(event.id);

    expect(dbEvent.going).toEqual(1);
  });
  it('rsvp to event twice', async () => {
    const addRsvp = () =>
      client.mutate({
        mutation: gql`
          mutation rsvp($input: CreateRsvpInput!) {
            addRsvp(input: $input) {
              rsvp {
                id
                user {
                  id
                }
                event {
                  id
                  isAttending
                }
              }
              event {
                id
              }
            }
          }
        `,
        variables: { input: { eventId: event.id } },
      });

    await addRsvp();
    const results = await addRsvp();

    const { data } = results;
    expect(data).toMatchObject({
      addRsvp: {
        __typename: 'CreateRsvpPayload',
        event: {
          __typename: 'Event',
          id: event.id,
        },
        rsvp: {
          __typename: 'Rsvp',
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
          event: {
            __typename: 'Event',
            id: event.id,
            isAttending: true,
          },
          user: {
            __typename: 'User',
            id: USER_ID,
          },
        },
      },
    });

    const dbRsvp = await Rsvp.byId(data.addRsvp.rsvp.id);

    expect(dbRsvp).toMatchObject({
      id: data.addRsvp.rsvp.id,
      userId: USER_ID,
      eventId: event.id,
      action: 'add',
    });

    const dbEvent = await Event.byId(event.id);

    expect(dbEvent.going).toEqual(1);
    const rsvpLog = await RsvpLog.all({ eventId: event.id, userId: USER_ID });
    expect(rsvpLog).toHaveLength(1);
    expect(rsvpLog[0]).toMatchObject({
      userId: USER_ID,
      eventId: event.id,
      action: 'add',
    });
  });

  it("Doesn't rsvp to full event", async () => {
    await Event.update({ id: event.id, going: 5 });

    const results = client.mutate({
      mutation: gql`
        mutation rsvp($input: CreateRsvpInput!) {
          addRsvp(input: $input) {
            rsvp {
              id
              user {
                id
              }
              event {
                id
                isAttending
              }
            }
            event {
              id
            }
          }
        }
      `,
      variables: { input: { eventId: event.id } },
    });
    expect.assertions(1);
    await expect(results).rejects.toEqual(
      new Error(`GraphQL error: Event ${event.id} full`)
    );
  });

  it("Doesn't rsvp to event after its start time", async () => {
    const time = ZonedDateTime.now(NYC_TZ)
      .minusMinutes(1)
      .withZoneSameInstant(ZoneId.UTC)
      .toString();

    await Event.update({ id: event.id, time });

    const results = client.mutate({
      mutation: gql`
        mutation rsvp($input: CreateRsvpInput!) {
          addRsvp(input: $input) {
            rsvp {
              id
              user {
                id
              }
              event {
                id
                isAttending
              }
            }
            event {
              id
            }
          }
        }
      `,
      variables: { input: { eventId: event.id } },
    });
    expect.assertions(1);
    await expect(results).rejects.toEqual(
      new Error(`GraphQL error: Event ${event.id} not found`)
    );
  });

  it("Doesn't rsvp to event before visibleAt", async () => {
    const visibleAt = ZonedDateTime.now(NYC_TZ)
      .plusDays(1)
      .withZoneSameInstant(ZoneId.UTC)
      .toString();

    await Event.update({ id: event.id, visibleAt });

    const results = client.mutate({
      mutation: gql`
        mutation rsvp($input: CreateRsvpInput!) {
          addRsvp(input: $input) {
            rsvp {
              id
              user {
                id
              }
              event {
                id
                isAttending
              }
            }
            event {
              id
            }
          }
        }
      `,
      variables: { input: { eventId: event.id } },
    });
    expect.assertions(1);
    await expect(results).rejects.toEqual(
      new Error(`GraphQL error: Event ${event.id} not found`)
    );
  });

  it('unrsvp from event', async () => {
    const rsvp = factory.build('rsvp', { eventId: event.id, userId: USER_ID });
    await Rsvp.insert(rsvp);
    await Event.update({ id: event.id, going: 1 });

    const results = await client.mutate({
      mutation: gql`
        mutation rsvp($input: CreateRsvpInput!) {
          removeRsvp(input: $input) {
            rsvp {
              id
            }
            event {
              id
            }
          }
        }
      `,
      variables: { input: { eventId: event.id } },
    });
    const { data } = results;
    expect(data).toMatchObject({
      removeRsvp: {
        __typename: 'CreateRsvpPayload',
        event: {
          __typename: 'Event',
          id: event.id,
        },
        rsvp: {
          __typename: 'Rsvp',
          id: rsvp.id,
        },
      },
    });

    const dbRsvp = await Rsvp.byId(rsvp.id);

    expect(dbRsvp).toMatchObject({
      id: rsvp.id,
      userId: USER_ID,
      eventId: event.id,
      action: 'remove',
    });

    const dbEvent = await Event.byId(event.id);

    expect(dbEvent.going).toEqual(0);

    const rsvpLog = await RsvpLog.all({ eventId: event.id, userId: USER_ID });
    expect(rsvpLog).toHaveLength(1);
    expect(rsvpLog[0]).toMatchObject({
      userId: USER_ID,
      eventId: event.id,
      action: 'remove',
    });
  });

  it('get user rsvps', async () => {
    const rsvp = factory.build('rsvp', {
      eventId: event.id,
      userId: USER_ID,
    });
    await Rsvp.insert(rsvp);

    const results = await client.query({
      query: gql`
        query userWithRsvps($id: ID!) {
          user(id: $id) {
            id
            rsvps {
              count
              edges {
                node {
                  id
                  lastReadTs
                }
              }
            }
          }
        }
      `,
      variables: { id: USER_ID },
    });

    const { data } = results;
    expect(data).toMatchObject({
      user: {
        __typename: 'User',
        id: USER_ID,
        rsvps: {
          count: 1,
          edges: [
            {
              node: {
                __typename: 'Rsvp',
                id: rsvp.id,
              },
            },
          ],
        },
      },
    });
  });

  it('event rsvps resolves invites', async () => {
    const invite = factory.build('eventInvite', {
      eventId: event.id,
      inviterId: USER_ID,
    });
    await Invitation.insert(invite);

    const rsvp = factory.build('rsvp', {
      eventId: event.id,
      userId: USER_ID,
    });
    await Rsvp.insert(rsvp);

    const inviteRsvp = factory.build('rsvp', {
      eventId: event.id,
      inviteId: invite.id,
    });
    await Rsvp.insert(inviteRsvp);

    const results = await client.query({
      query: gql`
        query eventRsvps($id: ID!) {
          event(id: $id) {
            rsvps {
              count
              edges {
                node {
                  id
                  user {
                    id
                  }
                  invite {
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

    const { data } = results;
    expect(data.event.rsvps).toMatchObject({
      count: 2,
      edges: expect.arrayContaining([
        expect.objectContaining({
          node: expect.objectContaining({
            id: rsvp.id,
            invite: null,
            user: expect.objectContaining({
              id: USER_ID,
            }),
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            id: inviteRsvp.id,
            user: null,
            invite: expect.objectContaining({
              id: invite.id,
            }),
          }),
        }),
      ]),
    });
  });

  it('blocks non-admin users from RSVPing other users', () => {
    setAdmin(false);
    return expect(
      client.mutate({
        mutation: gql`
          mutation rsvp($input: CreateRsvpInput!) {
            addRsvp(input: $input) {
              rsvp {
                id
              }
            }
          }
        `,
        variables: { input: { eventId: event.id, userId: anotherUser.id } },
      })
    ).rejects.toMatchSnapshot();
  });

  it('allows admin users to RSVP other users', async () => {
    setAdmin(true);
    const {
      data: {
        addRsvp: { rsvp },
      },
    } = await client.mutate({
      mutation: gql`
        mutation rsvp($input: CreateRsvpInput!) {
          addRsvp(input: $input) {
            rsvp {
              id
              user {
                firstName
                id
              }
            }
          }
        }
      `,
      variables: { input: { eventId: event.id, userId: anotherUser.id } },
    });

    expect(rsvp.user.id).toEqual(anotherUser.id);
    expect(rsvp.user.firstName).toEqual(anotherUser.firstName);
  });
});
