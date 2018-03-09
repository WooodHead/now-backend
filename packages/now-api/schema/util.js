import { get, slice } from 'lodash';
import { query } from '../db';

export const userIdFromContext = context => get(context, ['user', 'id']);
export const userFromContext = context => get(context, ['user']);

const toBase64 = str => Buffer.from(str).toString('base64');
const fromBase64 = str => Buffer.from(str, 'base64').toString();

const paginationDefaults = {
  cursorDeserialize: x => x,
  queryParamsExtra: {},
};

export const buildEdge = (cursorId, node) => ({
  cursor: toBase64(String(node[cursorId])),
  node,
});

export const paginatify = async (settings, { first, last, after, before }) => {
  const pageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const options = { ...paginationDefaults, ...settings };

  let { expr } = options;

  const { exprValues, cursorId, tableName, cursorDeserialize } = options;

  if (after) {
    expr += ` and ${cursorId} > :after`;
    exprValues[':after'] = cursorDeserialize(fromBase64(after));
  }

  if (before) {
    expr += ` and ${cursorId} < :before`;
    exprValues[':before'] = cursorDeserialize(fromBase64(before));
  }

  const params = {
    TableName: tableName,
    KeyConditionExpression: expr,
    ExpressionAttributeValues: exprValues,
    ...options.queryParamsExtra,
  };

  const serverData = await query(params);
  let data = serverData;

  // if after, default first, if before default last, otherwise default first
  let actualFirst = first;
  let actualLast = last;

  if (before && last === undefined) {
    actualLast = 20;
  } else if (first === undefined) {
    actualFirst = 20;
  }

  if (actualFirst <= 0) {
    throw new Error('first must be greater than 0');
  } else if (actualFirst !== undefined) {
    data = slice(serverData, 0, actualFirst);
    pageInfo.hasNextPage = data.length < serverData.length;
  }
  if (actualLast <= 0) {
    throw new Error('last must be greater than 0');
  } else if (actualLast !== undefined) {
    const maxLast =
      actualLast > serverData.length ? serverData.length : actualLast;
    data = slice(serverData, -maxLast);
    pageInfo.hasPreviousPage = data.length < serverData.length;
  }
  return {
    pageInfo,
    edges: data.map(d => buildEdge(cursorId, d)),
  };
};
