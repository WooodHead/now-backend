import { get, slice, isInteger, memoize } from 'lodash';
import { ChronoUnit, LocalDate, ZoneId } from 'js-joda';

export const userIdFromContext = context => get(context, ['user', 'id']);
const DEFAULT_PAGE_SIZE = 20;
const toBase64 = str => Buffer.from(str).toString('base64');
const fromBase64 = str => Buffer.from(str, 'base64').toString();

export const identity = a => a;

export const defaultCursorSerializer = (cursorId, node) =>
  toBase64(String(node[cursorId]));

export const buildEdge = (cursorId, node) => ({
  cursor: defaultCursorSerializer(cursorId, node),
  node,
});

export const buildEdgeWithCursorIdSubstring = (indexStart, indexEnd) => (
  cursorId,
  node
) => ({
  cursor: Buffer.from(
    String(node[cursorId.substring(indexStart, indexEnd)])
  ).toString('base64'),
  node,
});

export const sqlPaginatify = async (
  cursorId,
  builder,
  {
    first,
    last,
    after,
    before,
    cursorDeserialize = identity,
    reverse = false,
    offset = undefined,
    select = '*',
    edgeBuilder = buildEdge,
  } = {}
) => {
  const builderForCount = builder.clone();
  const count = () =>
    builderForCount
      .count(cursorId)
      .then(([{ count: stringCount }]) => Number(stringCount));

  const lazy = memoize(async () => {
    const pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
    };
    const pagedQuery = builder.clone().select(select);

    const firstUnset = first === undefined || first === null;
    const lastUnset = last === undefined || last === null;

    if (!firstUnset && !lastUnset) {
      throw new Error('Use first or last, but not both together');
    }

    if (offset && isInteger(offset)) {
      pagedQuery.offset(offset);
    } else {
      if (after) {
        pagedQuery.where(
          cursorId,
          reverse ? '<' : '>',
          cursorDeserialize(fromBase64(after))
        );
      }

      if (before) {
        pagedQuery.where(
          cursorId,
          reverse ? '>' : '<',
          cursorDeserialize(fromBase64(before))
        );
      }
    }

    // if after, default first, if before default last, otherwise default first
    let actualFirst = first;
    let actualLast = last;

    if (before && lastUnset) {
      actualLast = DEFAULT_PAGE_SIZE;
    } else if (firstUnset && lastUnset) {
      actualFirst = DEFAULT_PAGE_SIZE;
    }

    // Fetch max page size + 1 so we know if there is more
    const limit = Math.max(actualFirst || 0, actualLast || 0) + 1;
    let data = [];
    let serverData = [];

    if (actualFirst <= 0) {
      throw new Error('first must be greater than 0');
    } else if (actualFirst !== undefined) {
      serverData = await pagedQuery
        .limit(limit)
        .orderBy(cursorId, reverse ? 'desc' : 'asc');
      data = slice(serverData, 0, actualFirst);
      pageInfo.hasNextPage = data.length < serverData.length;
    }
    if (actualLast <= 0) {
      throw new Error('last must be greater than 0');
    } else if (actualLast !== undefined) {
      const subquery = pagedQuery
        .clone()
        .limit(limit)
        .orderBy(cursorId, reverse ? 'asc' : 'desc');
      serverData = await pagedQuery
        .from(subquery.as('inner'))
        .orderBy(cursorId, reverse ? 'desc' : 'asc');
      const maxLast =
        actualLast > serverData.length ? serverData.length : actualLast;
      data = slice(serverData, -maxLast);
      pageInfo.hasPreviousPage = data.length < serverData.length;
    }
    return { data, pageInfo };
  });

  return {
    pageInfo: () => lazy().then(({ pageInfo }) => pageInfo),
    count,
    edges: () =>
      lazy().then(({ data }) => data.map(d => edgeBuilder(cursorId, d))),
  };
};

export const computeAge = birthDate => {
  const now = LocalDate.now(ZoneId.of('America/New_York'));
  let then;
  if (typeof birthDate === 'string') {
    then = LocalDate.parse(birthDate);
  } else if ('until' in birthDate) {
    then = birthDate;
  } else {
    throw new Error('Unexpected type');
  }
  return then.until(now, ChronoUnit.YEARS);
};
