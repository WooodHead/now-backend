import 'js-joda-timezone';

import sql from './src/db/sql';

afterAll(() => sql.destroy());

expect.extend({
  toBeNumeric: arg => {
    if (typeof arg === 'number') {
      return { message: () => `expected ${arg} to be numeric`, pass: true };
    }
    return { message: () => `expected ${arg} to be numeric`, pass: false };
  },
});
