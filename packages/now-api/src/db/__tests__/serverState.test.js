import { randomBytes } from 'crypto';

import sql from '../sql';
import { SQL_TABLES } from '../constants';
import { testValue } from '../serverState';

const truncateTables = () =>
  Promise.all([sql(SQL_TABLES.SERVER_STATE).truncate()]);

beforeEach(() => truncateTables());
afterEach(() => truncateTables());

describe('serverState', () => {
  it('works as advertised', async () => {
    expect.assertions(4);

    const someString = randomBytes(16).toString('hex');
    const anotherString = randomBytes(16).toString('hex');

    expect(await testValue.get()).toBeUndefined();
    await testValue.set(someString);
    expect(await testValue.get()).toEqual(someString);
    await testValue.set(anotherString);
    expect(await testValue.get()).toEqual(anotherString);
    expect(
      await sql(SQL_TABLES.SERVER_STATE)
        .count(sql.raw('*'))
        .first()
    ).toEqual({
      count: '1',
    });
  });
});
