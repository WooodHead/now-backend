import { validUserPref } from '../util';

const PREF = 'pref';
describe('validUserPref', () => {
  it.each([
    [{ preferences: null }, true],
    [{ preferences: {} }, true],
    [{ preferences: { [PREF]: true } }, true],
    [{ preferences: { [PREF]: false } }, false],
  ])('handles all edge cases', (user, valid) => {
    expect(validUserPref(PREF)(user)).toEqual(valid);
  });
});
