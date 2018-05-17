import { sortBy, orderBy } from 'lodash';
import { sqlPaginatify } from '../util';
import factory from '../../db/factory';
import sql from '../../db/sql';
import { User } from '../../db/repos';
import { SQL_TABLES } from '../../db/constants';

describe('sql paginaitify', () => {
  const userCount = 30;
  const users = factory.buildList('user', userCount);

  const truncateTables = () => Promise.all([sql(SQL_TABLES.USERS).truncate()]);

  beforeAll(() =>
    truncateTables().then(() =>
      Promise.all([sql(SQL_TABLES.USERS).insert(users)])
    )
  );
  afterAll(() => truncateTables());
  it('no arguments return basic page, defaults to 20', async () => {
    const builder = User.all();

    const results = await sqlPaginatify('id', builder);
    expect(results).toMatchObject({
      count: userCount,
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
      },
      edges: expect.anything(),
    });

    expect(results.edges.map(({ node }) => node.id)).toEqual(
      sortBy(users, 'id')
        .map(({ id }) => id)
        .slice(0, 20)
    );
  });
  it('reversable', async () => {
    const builder = User.all();

    const results = await sqlPaginatify('id', builder, { reverse: true });
    expect(results).toMatchObject({
      count: userCount,
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
      },
      edges: expect.anything(),
    });

    expect(results.edges.map(({ node }) => node.id)).toEqual(
      orderBy(users, 'id', ['desc'])
        .map(({ id }) => id)
        .slice(0, 20)
    );
  });

  describe('first and last', () => {
    it('first and last cannot be used together', async () => {
      const builder = User.all();

      const results = sqlPaginatify('id', builder, { first: 40, last: 40 });
      expect(results).rejects.toEqual(
        new Error('Use first or last, but not both together')
      );
    });

    it('first more than length returns all', async () => {
      const builder = User.all();

      const results = await sqlPaginatify('id', builder, { first: 40 });
      expect(results).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
        },
        edges: expect.anything(),
      });

      expect(results.edges.map(({ node }) => node.id)).toEqual(
        sortBy(users, 'id').map(({ id }) => id)
      );
    });

    it('first less than length returns first', async () => {
      const builder = User.all();

      const results = await sqlPaginatify('id', builder, { first: 10 });
      expect(results).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
        },
        edges: expect.anything(),
      });

      expect(results.edges.map(({ node }) => node.id)).toEqual(
        sortBy(users, 'id')
          .map(({ id }) => id)
          .slice(0, 10)
      );
    });

    it('last more than length returns all', async () => {
      const builder = User.all();

      const results = await sqlPaginatify('id', builder, { last: 40 });
      expect(results).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
        },
        edges: expect.anything(),
      });

      expect(results.edges.map(({ node }) => node.id)).toEqual(
        sortBy(users, 'id').map(({ id }) => id)
      );
    });

    it('last less than length returns last', async () => {
      const builder = User.all();

      const results = await sqlPaginatify('id', builder, { last: 10 });
      expect(results).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: false,
        },
        edges: expect.anything(),
      });

      expect(results.edges.map(({ node }) => node.id)).toEqual(
        sortBy(users, 'id')
          .map(({ id }) => id)
          .slice(-10)
      );
    });
  });

  describe('before and after', () => {
    it('returns rows after cursor', async () => {
      const builder = User.all();

      const first10 = await sqlPaginatify('id', builder, { first: 10 });
      const { cursor } = first10.edges.pop();
      const next10 = await sqlPaginatify('id', builder, {
        first: 10,
        after: cursor,
      });
      expect(next10).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
        },
        edges: expect.anything(),
      });
      expect(next10.edges.map(({ node }) => node.id)).toEqual(
        sortBy(users, 'id')
          .map(({ id }) => id)
          .slice(10, 20)
      );
    });

    it('reverse works with after cursor', async () => {
      const builder = User.all();

      const first10 = await sqlPaginatify('id', builder, {
        first: 10,
        reverse: true,
      });
      const { cursor } = first10.edges.pop();

      const next10 = await sqlPaginatify('id', builder, {
        first: 10,
        after: cursor,
        reverse: true,
      });
      expect(next10).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
        },
        edges: expect.anything(),
      });
      expect(next10.edges.map(({ node }) => node.id)).toEqual(
        orderBy(users, 'id', ['desc'])
          .map(({ id }) => id)
          .slice(10, 20)
      );
    });

    it('returns rows before cursor', async () => {
      const builder = User.all();

      const last10 = await sqlPaginatify('id', builder, { last: 10 });
      const { cursor } = last10.edges[0];

      const previous10 = await sqlPaginatify('id', builder, {
        last: 10,
        before: cursor,
      });
      expect(previous10).toMatchObject({
        count: userCount,
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: false,
        },
        edges: expect.anything(),
      });
      expect(previous10.edges.map(({ node }) => node.id)).toEqual(
        sortBy(users, 'id')
          .map(({ id }) => id)
          .slice(10, 20)
      );
    });
  });
});
