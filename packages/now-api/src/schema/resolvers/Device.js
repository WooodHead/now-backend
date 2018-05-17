import sql from '../../db/sql';
import { SQL_TABLES } from '../../db/constants';
import { userQuery } from './User';
import { userIdFromContext } from '../util';
import { assocDevice } from '../../fcm';

export const getDevices = userId => sql(SQL_TABLES.DEVICES).where({ userId });

const user = (device, args, context) =>
  userQuery(device, { id: device.userId }, context);

export const resolvers = { user };

const registerDevice = (root, { input: { token, type, model } }, context) => {
  const userId = userIdFromContext(context);
  const now = new Date().toISOString();

  return sql(SQL_TABLES.DEVICES)
    .where({ token })
    .then(devices => {
      if (devices.length === 0) {
        return sql(SQL_TABLES.DEVICES).insert({ token, type, model, userId });
      }
      return sql(SQL_TABLES.DEVICES)
        .where({ token })
        .update({ type, model, userId, updatedAt: now });
    })
    .then(() =>
      sql(SQL_TABLES.DEVICES)
        .where({ token })
        .first()
    )
    .then(device => {
      assocDevice(token, context.user);
      return { device };
    });
};

export const mutations = { registerDevice };
