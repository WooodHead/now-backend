import { query, update, TABLES } from '../../db';
import { userQuery } from './User';
import { userIdFromContext } from '../util';
import { assocDevice } from '../../fcm';

export const getDevices = userId =>
  query({
    TableName: TABLES.DEVICE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    IndexName: 'userId-index',
  });

const user = (device, args, context) =>
  userQuery(device, { id: device.userId }, context);

export const resolvers = { user };

const registerDevice = (root, { input: { token, type, model } }, context) => {
  const userId = userIdFromContext(context);
  const now = new Date().toISOString();

  return update(
    TABLES.DEVICE,
    { token },
    'set #t=:type, model=:model, userId=:userId, createdAt=if_not_exists(createdAt,:now), updatedAt=:now',
    {
      ':type': type,
      ':model': model,
      ':userId': userId,
      ':now': now,
    },
    { '#t': 'type' }
  ).then(r => {
    assocDevice(token, context.user);
    return { device: r.Attributes };
  });
};

export const mutations = { registerDevice };
