import AWS from 'aws-sdk';

const promisify = require('util.promisify');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const get = (table, key = {}) =>
  promisify(callback =>
    dynamoDb.get(
      {
        TableName: table,
        Key: key,
      },
      callback
    )
  )().then(response => response.Item);
export const put = (table, item) =>
  promisify(callback =>
    dynamoDb.put(
      {
        TableName: table,
        Item: item,
      },
      callback
    )
  );
export const update = (table, key, expr, values, names = undefined) =>
  promisify(callback =>
    dynamoDb.update(
      {
        TableName: table,
        Key: key,
        ExpressionAttributeValues: values,
        ExpressionAttributeNames: names,
        UpdateExpression: expr,
        ReturnValues: 'ALL_NEW',
      },
      callback
    )
  );
export const scan = table =>
  promisify(callback =>
    dynamoDb.scan(
      {
        TableName: table,
      },
      callback
    )
  )().then(response => response.Items);
