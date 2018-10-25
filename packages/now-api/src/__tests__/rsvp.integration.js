import gql from 'graphql-tag';
import { ZonedDateTime, ZoneId } from 'js-joda';
import uuid from 'uuid/v4';

import { client, setAdmin, USER_ID } from '../db/mock';
import { SQL_TABLES, GLOBAL_COMMUNITY_ID } from '../db/constants';
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
const membership = {
  id: uuid(),
  userId: USER_ID,
  communityId: GLOBAL_COMMUNITY_ID,
};
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
    sql(SQL_TABLES.MESSAGES).truncate(),
    sql(SQL_TABLES.MEMBERSHIPS).truncate(),
  ]);

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.ACTIVITIES).insert(activity),
      sql(SQL_TABLES.EVENTS).insert(event),
      sql(SQL_TABLES.LOCATIONS).insert(location),
      sql(SQL_TABLES.MEMBERSHIPS).insert(membership),
      sql(SQL_TABLES.USERS).insert([user, anotherUser]),
    ])
  ));
afterEach(() => truncateTables());

describe('Rsvp', () => {
  const rsvpMutation = gql`
    mutation rsvp($input: CreateRsvpInput!) {
      addRsvp(input: $input) {
        rsvp {
          id
          user {
            id
            firstName
            lastName
          }
          event {
            id
            isAttending
            isHosting
            messages {
              edges {
                node {
                  text
                }
              }
            }
          }
          host
        }
        event {
          id
        }
      }
    }
  `;

  it('rsvp to event', async () => {
    const results = await client.mutate({
      mutation: rsvpMutation,
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
            isHosting: false,
            messages: {
              edges: [
                { node: { text: `👋 ${user.firstName} joined this activity` } },
              ],
            },
          },
          user: {
            __typename: 'User',
            id: USER_ID,
          },
          host: false,
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
        mutation: rsvpMutation,
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
            isHosting: false,
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
      mutation: rsvpMutation,
      variables: { input: { eventId: event.id } },
    });
    expect.assertions(1);
    await expect(results).rejects.toEqual(
      new Error(`GraphQL error: Event ${event.id} full`)
    );
  });

  it("Doesn't rsvp to private event if not a member", async () => {
    await Event.update({ id: event.id, communityId: uuid() });

    const results = client.mutate({
      mutation: rsvpMutation,
      variables: { input: { eventId: event.id } },
    });
    expect.assertions(1);
    await expect(results).rejects.toEqual(
      new Error(`GraphQL error: Event ${event.id} not found`)
    );
  });

  it("Doesn't rsvp to event after its start time", async () => {
    const time = ZonedDateTime.now(NYC_TZ)
      .minusMinutes(1)
      .withZoneSameInstant(ZoneId.UTC)
      .toString();

    await Event.update({ id: event.id, time });

    const results = client.mutate({
      mutation: rsvpMutation,
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
      mutation: rsvpMutation,
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
              messages {
                edges {
                  node {
                    text
                  }
                }
              }
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
          messages: {
            edges: [
              {
                node: { text: `${user.firstName} left this activity` },
              },
            ],
          },
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

  it('pages user rsvps', async () => {
    const events = factory.buildList('event', 25);
    await sql(SQL_TABLES.EVENTS).insert(events);
    await Rsvp.insert(
      events.map(e =>
        factory.build('rsvp', {
          eventId: e.id,
          userId: USER_ID,
        })
      )
    );

    const firstPage = await client.query({
      query: gql`
        query userWithRsvps($id: ID!) {
          user(id: $id) {
            id
            rsvps {
              count
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              edges {
                cursor
              }
            }
          }
        }
      `,
      variables: { id: USER_ID },
    });

    const {
      data: {
        user: { rsvps },
      },
    } = firstPage;

    expect(rsvps.count).toBe(25);
    expect(rsvps.edges).toHaveLength(20);
    expect(rsvps.pageInfo.hasNextPage).toBe(true);
    expect(rsvps.pageInfo.hasPreviousPage).toBe(false);

    const secondPage = await client.query({
      query: gql`
        query userWithRsvps($id: ID!, $after: String) {
          user(id: $id) {
            id
            rsvps(after: $after, first: 20) {
              count
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              edges {
                cursor
              }
            }
          }
        }
      `,
      variables: { id: USER_ID, after: rsvps.edges[19].cursor },
    });

    const {
      data: {
        user: { rsvps: secondRsvps },
      },
    } = secondPage;

    expect(secondRsvps.count).toBe(25);
    expect(secondRsvps.edges).toHaveLength(5);
    expect(secondRsvps.pageInfo.hasNextPage).toBe(false);
    expect(secondRsvps.pageInfo.hasPreviousPage).toBe(false);
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
      edges: [
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
      ],
    });
  });

  it('you are no longer first if you leave an activity', async () => {
    const rsvp = factory.build('rsvp', {
      action: 'remove',
      eventId: event.id,
      userId: USER_ID,
    });
    await Rsvp.insert(rsvp);

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
      count: 0,
      edges: [],
    });
  });

  it('blocks non-admin users from RSVPing other users', () => {
    setAdmin(false);
    return expect(
      client.mutate({
        mutation: rsvpMutation,
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
      mutation: rsvpMutation,
      variables: { input: { eventId: event.id, userId: anotherUser.id } },
    });

    expect(rsvp.user.id).toEqual(anotherUser.id);
    expect(rsvp.host).toBe(false);
    expect(rsvp.user.firstName).toEqual(anotherUser.firstName);
  });

  it('blocks non-admin users from setting the host field to true', () => {
    setAdmin(false);
    return expect(
      client.mutate({
        mutation: rsvpMutation,
        variables: { input: { eventId: event.id, host: true } },
      })
    ).rejects.toMatchSnapshot();
  });

  it('allows admin users to set and unset the host field', async () => {
    setAdmin(true);
    const {
      data: {
        addRsvp: { rsvp },
      },
    } = await client.mutate({
      mutation: rsvpMutation,
      variables: {
        input: { eventId: event.id, userId: anotherUser.id, host: true },
      },
    });

    expect(rsvp.host).toBe(true);

    await client.mutate({
      mutation: rsvpMutation,
      variables: {
        input: { eventId: event.id, userId: anotherUser.id, host: false },
      },
    });

    expect(
      (await sql(SQL_TABLES.EVENTS)
        .where({ id: event.id })
        .first()).going
    ).toBe(1);
  });

  it('returns isHosting: true after setting the host field', async () => {
    setAdmin(true);
    await client.mutate({
      mutation: rsvpMutation,
      variables: { input: { eventId: event.id, userId: user.id, host: true } },
    });
    const { data } = await client.query({
      query: gql`
        query event($id: ID!) {
          event(id: $id) {
            isAttending
            isHosting
          }
        }
      `,
      variables: { id: event.id },
    });

    expect(data.event.isAttending).toBe(true);
    expect(data.event.isHosting).toBe(true);
  });
});
