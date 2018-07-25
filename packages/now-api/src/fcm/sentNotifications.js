// @flow
import uuid from 'uuid/v4';

import sql from '../db/sql';
import { SQL_TABLES } from '../db/constants';

// DO NOT run this in a transaction, so that it succeeds or fails atomically.

const logSentNotification = (referenceId: string, key: string): Promise<void> =>
  sql(SQL_TABLES.SENT_NOTIFICATIONS)
    .insert({
      id: uuid(),
      referenceId,
      key,
    })
    .then(
      () => {},
      () => {
        throw new Error('Duplicate notification send.');
      }
    );

export default logSentNotification;
