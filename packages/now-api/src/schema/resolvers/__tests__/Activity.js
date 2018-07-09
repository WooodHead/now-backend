import { getToday } from '../Activity';
import sql from '../../../db/sql';
import { SQL_TABLES } from '../../../db/constants';
import { mockNow, restoreNow } from '../../../../testutils/date';

const truncateTables = () =>
  Promise.all([sql(SQL_TABLES.ACTIVITIES).truncate()]);

beforeEach(() => truncateTables());
afterEach(() => truncateTables());

describe('getToday', () => {
  afterEach(() => {
    restoreNow();
  });

  it("gives today's date at 8:30pm", () => {
    mockNow('2018-04-30T20:30:00-04:00');
    expect(getToday()).toEqual('2018-04-30');
  });

  it("gives tomorrow's date at 9:00pm", () => {
    mockNow('2018-04-30T21:00:00-04:00');
    expect(getToday()).toEqual('2018-05-01');
  });
});
