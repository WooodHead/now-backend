import gql from 'graphql-tag';
import uuid from 'uuid/v4';

import { client, setAdmin, USER_ID } from '../db/mock';
import { GLOBAL_COMMUNITY_ID, SQL_TABLES } from '../db/constants';
import sql, { genRandomUuid } from '../db/sql';
import factory from '../db/factory';

const communities = factory.buildList('community', 3);
const users = [
  factory.build('user', { id: USER_ID }),
  ...factory.buildList('user', 5),
];

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.USERS).truncate(),
    sql(SQL_TABLES.COMMUNITIES)
      .truncate()
      .then(() =>
        sql(SQL_TABLES.COMMUNITIES).insert({
          id: GLOBAL_COMMUNITY_ID,
          name: 'Global Community',
        })
      ),
    sql(SQL_TABLES.MEMBERSHIPS).truncate(),
    sql(SQL_TABLES.MEMBERSHIP_LOG).truncate(),
  ]);

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.USERS).insert(users),
      sql(SQL_TABLES.COMMUNITIES).insert(communities),
      sql(SQL_TABLES.MEMBERSHIPS).insert(
        users.map(({ id: userId }) => ({
          id: genRandomUuid(),
          communityId: GLOBAL_COMMUNITY_ID,
          userId,
        }))
      ),
    ])
  ));

afterEach(() => {
  setAdmin(false);
  return truncateTables();
});

const communityQuery = gql`
  query community($id: ID!) {
    community(id: $id) {
      id
      name
      isPublic
    }
  }
`;

const communityUsersQuery = gql`
  query community($id: ID!) {
    community(id: $id) {
      id
      name
      users {
        count
        edges {
          node {
            id
            firstName
          }
        }
      }
    }
  }
`;

const join = gql`
  mutation createMembership($communityId: ID!, $userId: ID!) {
    createMembership(input: { communityId: $communityId, userId: $userId }) {
      community {
        id
      }
    }
  }
`;

const leave = gql`
  mutation removeMembership($communityId: ID!, $userId: ID!) {
    removeMembership(input: { communityId: $communityId, userId: $userId }) {
      community {
        id
      }
    }
  }
`;

describe('Community', () => {
  it("lets you fetch a community you're in", async () => {
    const community = communities[0];
    await sql(SQL_TABLES.MEMBERSHIPS).insert({
      id: genRandomUuid(),
      userId: users[0].id,
      communityId: community.id,
    });
    const { data } = await client.query({
      query: communityQuery,
      variables: { id: community.id },
    });
    expect(data.community).toMatchObject({
      id: community.id,
      name: `${community.name}`,
      isPublic: false,
    });
  });

  it("doesn't let you fetch a community you're not in", async () => {
    await sql(SQL_TABLES.MEMBERSHIPS).insert({
      id: genRandomUuid(),
      userId: users[0].id,
      communityId: communities[0].id,
    });
    const { data } = await client.query({
      query: communityQuery,
      variables: { id: communities[1].id },
    });
    expect(data.community).toBeNull();
  });

  it('lets admins modify and learn about the members of a community', async () => {
    setAdmin(true);
    const community = communities[2];
    await client.mutate({
      mutation: join,
      variables: { userId: users[1].id, communityId: community.id },
    });
    await client.mutate({
      mutation: join,
      variables: { userId: users[2].id, communityId: community.id },
    });
    await client.mutate({
      mutation: join,
      variables: { userId: users[3].id, communityId: community.id },
    });
    await client.mutate({
      mutation: leave,
      variables: { userId: users[3].id, communityId: community.id },
    });

    const { data } = await client.query({
      query: communityUsersQuery,
      variables: { id: community.id },
    });
    expect(data.community.users.count).toBe(2);
    const nodes = data.community.users.edges.map(({ node }) => node);
    expect(nodes).toContainEqual(
      expect.objectContaining({
        id: users[1].id,
        firstName: users[1].firstName,
      })
    );
    expect(nodes).toContainEqual(
      expect.objectContaining({
        id: users[2].id,
        firstName: users[2].firstName,
      })
    );

    const logs = await sql(SQL_TABLES.MEMBERSHIP_LOG);
    expect(logs).toHaveLength(4);
    expect(logs.filter(l => l.action === 'add')).toHaveLength(3);
    expect(logs.filter(l => l.action === 'remove')).toHaveLength(1);
    expect(logs.filter(l => l.action === 'remove')[0]).toMatchObject({
      userId: users[3].id,
      communityId: community.id,
    });
  });

  it("doesn't let admins do invalid things", async () => {
    setAdmin(true);
    const badCommunityId = client.mutate({
      mutation: join,
      variables: { userId: users[1].id, communityId: uuid() },
    });
    await expect(badCommunityId).rejects.toMatchSnapshot();

    const badUserId = client.mutate({
      mutation: join,
      variables: { userId: uuid(), communityId: communities[1].id },
    });
    await expect(badUserId).rejects.toMatchSnapshot();
  });
});
