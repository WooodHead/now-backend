/* eslint-disable no-console */
// AWS_PROFILE=prod AWS_REGION=us-east-1 ./node_modules/.bin/babel-node scripts/add-message-id.js
// pagination is not supported, so, like, maybe just keep re-running it until you're done

import uuid from 'uuid/v4';
import { scan, update, TABLES } from '../db';

scan(TABLES.MESSAGE, 'attribute_not_exists(id)')
  .then(items =>
    Promise.all(
      items.map(({ eventId, ts }) =>
        update(TABLES.MESSAGE, { eventId, ts }, 'set id=:id', { ':id': uuid() })
      )
    )
  )
  .then(updates => console.log(`${updates.length} rows updated`))
  .catch(e => console.error(e));
