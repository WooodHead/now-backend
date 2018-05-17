import { get, slice } from 'lodash';
import { ChronoUnit, LocalDate, ZoneId } from 'js-joda';

export const userIdFromContext = context => get(context, ['user', 'id']);
const DEFAULT_PAGE_SIZE = 20;
const toBase64 = str => Buffer.from(str).toString('base64');
const fromBase64 = str => Buffer.from(str, 'base64').toString();

export const identity = a => a;

export const buildEdge = (cursorId, node) => ({
  cursor: toBase64(String(node[cursorId])),
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
  } = {}
) => {
  const pageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
  };
  const [{ count: stringCount }] = await builder.clone().count(cursorId);
  const count = Number(stringCount);
  const pagedQuery = builder.clone();

  if (first !== undefined && last !== undefined) {
    throw new Error('Use first or last, but not both together');
  }

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

  // if after, default first, if before default last, otherwise default first
  let actualFirst = first;
  let actualLast = last;

  if (before && last === undefined) {
    actualLast = DEFAULT_PAGE_SIZE;
  } else if (first === undefined && last === undefined) {
    actualFirst = DEFAULT_PAGE_SIZE;
  }

  /*
   * Fetch max page size + 1 so we know if there is more
   */
  const limit =
    Math.max(
      actualFirst || DEFAULT_PAGE_SIZE,
      actualLast || DEFAULT_PAGE_SIZE
    ) + 1;
  let data = [];

  if (actualFirst <= 0) {
    throw new Error('first must be greater than 0');
  } else if (actualFirst !== undefined) {
    const serverData = await pagedQuery
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
    const serverData = await pagedQuery
      .from(subquery.as('inner'))
      .orderBy(cursorId, reverse ? 'desc' : 'asc');

    const maxLast =
      actualLast > serverData.length ? serverData.length : actualLast;
    data = slice(serverData, -maxLast);
    pageInfo.hasPreviousPage = data.length < serverData.length;
  }

  return {
    pageInfo,
    count,
    edges: data.map(d => buildEdge(cursorId, d)),
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
