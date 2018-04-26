import { splitName, concatMapOfArrays, putInOrder, ellipsize } from '../util';

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

describe('putInOrder', () => {
  it('does nothing given nothing', () => {
    expect(putInOrder([], [])).toEqual([]);
  });
  it('works given valid input', () => {
    expect(
      putInOrder([{ id: 1, a: 9 }, { id: 0, a: 8 }, { id: 7, a: 6 }], [0, 1, 7])
    ).toEqual([{ id: 0, a: 8 }, { id: 1, a: 9 }, { id: 7, a: 6 }]);
  });
});

describe('ellipsize', () => {
  it('does nothing on short text', () => {
    expect(ellipsize('', 20)).toEqual('');
    expect(ellipsize('hello', 20)).toEqual('hello');
  });

  it('shortens long text', () => {
    expect(ellipsize('hello this is a long sentence', 6)).toEqual('hello…');
    expect(ellipsize('hello this is a long sentence', 7)).toEqual('hello…');
    expect(ellipsize('hello this is a long sentence', 9)).toEqual('hello…');
    expect(ellipsize('hello this is a long sentence', 13)).toEqual(
      'hello this…'
    );
  });
});
