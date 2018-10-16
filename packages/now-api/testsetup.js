import 'js-joda-timezone';

import sql from './src/db/sql';
import logger from './src/logger';

afterAll(() => sql.destroy());

expect.extend({
  toBeNumeric: arg => {
    if (typeof arg === 'number') {
      return { message: () => `expected ${arg} to be numeric`, pass: true };
    }
    return { message: () => `expected ${arg} to be numeric`, pass: false };
  },
});

logger.transports.forEach(t => {
  t.silent = true; // eslint-disable-line no-param-reassign
});
