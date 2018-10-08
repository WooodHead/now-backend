import gql from 'graphql-tag';
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

  it('lets admins know the members of a community', async () => {
    setAdmin(true);
    const community = communities[2];
    await sql(SQL_TABLES.MEMBERSHIPS).insert([
      {
        id: genRandomUuid(),
        userId: users[1].id,
        communityId: community.id,
      },
      {
        id: genRandomUuid(),
        userId: users[2].id,
        communityId: community.id,
      },
    ]);

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
  });
});
