import { parseDate } from '../util';

describe('parseDate', () => {
  it('returns null for null', () => {
    expect(parseDate(null)).toBeNull();
  });
  it('turns a millisecond epoch into a js date', () => {
    const date = new Date();
    expect(parseDate(date.getTime())).toEqual(date);
  });
});
