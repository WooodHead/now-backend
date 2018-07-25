import logSentNotification from '../sentNotifications';
import { SQL_TABLES } from '../../db/constants';
import sql from '../../db/sql';

describe('logSentNotification', () => {
  const truncateTables = () =>
    Promise.all([sql(SQL_TABLES.SENT_NOTIFICATIONS).truncate()]);
  const DUMMY_REF = 'c879c7b5-3f09-4c0c-8ad0-4ec5d093a195';

  beforeAll(truncateTables);
  afterAll(truncateTables);

  it('allows logging a sent notification exactly once', async () => {
    expect.assertions(3);
    await expect(
      logSentNotification(DUMMY_REF, 'key a')
    ).resolves.toBeUndefined();
    await expect(
      logSentNotification(DUMMY_REF, 'key b')
    ).resolves.toBeUndefined();
    await expect(logSentNotification(DUMMY_REF, 'key a')).rejects.toEqual(
      expect.anything()
    );
  });
});
