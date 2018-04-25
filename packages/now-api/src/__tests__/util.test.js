import { splitName, concatMapOfArrays } from '../util';

describe('splitName', () => {
  it('splits two words into two words', () => {
    expect(splitName('two words')).toEqual(['two', 'words']);
    expect(splitName('two      words')).toEqual(['two', 'words']);
  });
  it('splits one word into one word', () => {
    expect(splitName('word')).toEqual(['word']);
  });
  it('splits multiple words into two words', () => {
    expect(splitName('three word phrase')).toEqual(['three', 'word phrase']);
    expect(splitName('four      or  even more words')).toEqual([
      'four',
      'or  even more words',
    ]);
  });
});

describe('concatMapOfArrays', () => {
  it('returns empty object given empty input', () => {
    expect(concatMapOfArrays()).toEqual({});
  });
  it("returns an what it's given with only one input", () => {
    expect(concatMapOfArrays({ a: [1], b: [1, 2] })).toEqual({
      a: [1],
      b: [1, 2],
    });
  });
  it('works right given multiple inputs', () => {
    expect(
      concatMapOfArrays({ a: [1, 2], b: [4] }, { a: [3], c: [9] })
    ).toEqual({ a: [1, 2, 3], b: [4], c: [9] });
  });
});
