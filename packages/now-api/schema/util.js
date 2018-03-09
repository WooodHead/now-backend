import { get, slice } from 'lodash';
import { query } from '../db';

export const userIdFromContext = context => get(context, ['user', 'id']);
export const userFromContext = context => get(context, ['user']);

const toBase64 = str => Buffer.from(str).toString('base64');
const fromBase64 = str => Buffer.from(str, 'base64').toString();

const paginationDefaults = {
  cursorDeserialize: x => x,
};

export const paginatify = async (settings, { first, last, after, before }) => {
  const pageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const options = Object.assign(paginationDefaults, settings);

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
  };

  const serverData = await query(params);
  let data = serverData;

  if (first <= 0) {
    throw new Error('first must be greater than 0');
  } else if (first !== undefined) {
    data = slice(serverData, 0, first);
    pageInfo.hasNextPage = data.length < serverData.length;
  }
  if (last <= 0) {
    throw new Error('last must be greater than 0');
  } else if (last !== undefined) {
    const maxLast = last > serverData.length ? serverData.length : last;
    data = slice(serverData, -maxLast);
    pageInfo.hasPreviousPage = data.length < serverData.length;
  }
  return {
    pageInfo,
    edges: data.map(d => ({
      cursor: toBase64(String(d[cursorId])),
      node: d,
    })),
  };
};
