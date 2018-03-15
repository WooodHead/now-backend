import AWS from 'aws-sdk';
import promisify from 'util.promisify';
import { rsvpId } from '../schema/util';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const pGet = promisify(dynamoDb.get.bind(dynamoDb));
const pScan = promisify(dynamoDb.scan.bind(dynamoDb));
const pUpdate = promisify(dynamoDb.update.bind(dynamoDb));
const pPut = promisify(dynamoDb.put.bind(dynamoDb));
const pQuery = promisify(dynamoDb.query.bind(dynamoDb));

export const get = (table, key = {}) =>
  pGet({
    TableName: table,
    Key: key,
  }).then(response => response.Item);
export const put = (table, item) =>
  pPut({
    TableName: table,
    Item: item,
  });
export const update = (table, key, expr, values, names = undefined) =>
  pUpdate({
    TableName: table,
    Key: key,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    UpdateExpression: expr,
    ReturnValues: 'ALL_NEW',
  });
export const scan = table =>
  pScan({
    TableName: table,
  }).then(response => response.Items);

export const query = params => pQuery(params).then(response => response.Items);

export const getUserRsvpByEvent = (userId, eventId) =>
  get('now_rsvp', rsvpId(eventId, userId));

export const getTemplate = id => get('now_template', { id });
