import { parseDate } from '../db';

describe('parseDate', () => {
  it('returns null for null', () => {
    expect(parseDate(null)).toBeNull();
  });
});
