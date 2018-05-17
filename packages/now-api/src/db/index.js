import AWS from 'aws-sdk';
import promisify from 'util.promisify';
import { concatMapOfArrays, isDev, promiseDelay } from '../util';

const dynamoOpts = {};
if (isDev()) {
  dynamoOpts.logger = console;
}

const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoOpts);

const pGet = promisify(dynamoDb.get.bind(dynamoDb));
const pScan = promisify(dynamoDb.scan.bind(dynamoDb));
const pUpdate = promisify(dynamoDb.update.bind(dynamoDb));
const pPut = promisify(dynamoDb.put.bind(dynamoDb));
const pQuery = promisify(dynamoDb.query.bind(dynamoDb));
const pBatchGet = promisify(dynamoDb.batchGet.bind(dynamoDb));

export const get = (table, key = {}) =>
  pGet({
    TableName: table,
    Key: key,
  }).then(response => response.Item);

export const put = (table, item, condition = undefined) =>
  pPut({
    TableName: table,
    Item: item,
    ConditionExpression: condition,
  });

export const update = (
  table,
  key,
  expr,
  values,
  names = undefined,
  condition = undefined
) =>
  pUpdate({
    TableName: table,
    Key: key,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    UpdateExpression: expr,
    ConditionExpression: condition,
    ReturnValues: 'ALL_NEW',
  });

export const updateDynamic = (table, key, values, condition = undefined) => {
  const expressions = [];
  const expressionNames = {};
  const expressionValues = {};
  Object.entries(values).forEach(([k, v], i) => {
    const attrName = `#f${i}`;
    const fieldName = `:f${i}`;
    expressions.push(`${attrName}=${fieldName}`);
    expressionNames[attrName] = k;
    expressionValues[fieldName] = v;
  });

  return update(
    table,
    key,
    `set ${expressions.join(', ')}`,
    expressionValues,
    expressionNames,
    condition
  );
};

export const scan = (table, filter = undefined) =>
  pScan({
    TableName: table,
    FilterExpression: filter,
  }).then(response => response.Items);

export const queryRaw = params => pQuery(params);
export const query = params => pQuery(params).then(response => response.Items);

const batchGetHelper = (params, delay = 50, accum = {}) =>
  pBatchGet(params).then(({ Responses, UnprocessedKeys }) => {
    const nextAccum = concatMapOfArrays(accum, Responses);
    if (!UnprocessedKeys || Object.keys(UnprocessedKeys).length === 0) {
      return nextAccum;
    }
    if (delay >= 2000) {
      return Promise.reject(new Error('too many retries'));
    }
    return promiseDelay(delay).then(() =>
      batchGetHelper(
        { ...params, RequestItems: UnprocessedKeys },
        delay * 2,
        nextAccum
      )
    );
  });

export const batchGet = (tableName, keys, keyName = 'id', opts = {}) => {
  const RequestItems = {
    [tableName]: { ...opts, Keys: keys.map(key => ({ [keyName]: key })) },
  };
  return batchGetHelper({ RequestItems }).then(response => response[tableName]);
};

export const createSet = someArray => dynamoDb.createSet(someArray);
