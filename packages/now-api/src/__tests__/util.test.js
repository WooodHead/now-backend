import {
  splitName,
  concatMapOfArrays,
  putInOrder,
  ellipsize,
  MIN_IOS,
  MIN_ANDROID,
  expiredUserAgent,
  processUserAgent,
  withHashId,
} from '../util';

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

describe('expiredUserAgent', () => {
  it.each([
    [{ client: 'not-meetup' }, false],
    [{ client: 'Meetup-Now', buildNumber: 1 }, false],
    [
      { client: 'Meetup-Now', buildNumber: MIN_ANDROID, platform: 'Android' },
      false,
    ],
    [
      {
        client: 'Meetup-Now',
        buildNumber: MIN_ANDROID - 1,
        platform: 'Android',
      },
      true,
    ],
    [
      {
        client: 'Meetup-Now',
        buildNumber: MIN_IOS,
        platform: 'Ios',
      },
      false,
    ],
    [
      {
        client: 'Meetup-Now',
        buildNumber: MIN_IOS - 1,
        platform: 'Ios',
      },
      true,
    ],
  ])('returns the right values', (userAgent, expected) => {
    expect(expiredUserAgent(userAgent)).toBe(expected);
  });
});

describe('processUserAgent', () => {
  it('processes Ios user agent', () => {
    expect(processUserAgent('Meetup-Now/1.1.0 Ios/11.4 Build 1')).toEqual({
      buildNumber: 1,
      client: 'Meetup-Now',
      clientVersion: '1.1.0',
      osVersion: '11.4',
      platform: 'Ios',
    });
  });
  it('processes Android user agent', () => {
    expect(
      processUserAgent('Meetup-Now/1.1.0 Android/8.0.0 Build 12691')
    ).toEqual({
      buildNumber: 12691,
      client: 'Meetup-Now',
      clientVersion: '1.1.0',
      osVersion: '8.0.0',
      platform: 'Android',
    });
  });
});

describe('withHashId', () => {
  it('puts some garbage in the object', () => {
    const o = {
      okay: 9,
      whatever: 'something',
    };
    expect(withHashId(o)).toMatchObject({
      okay: 9,
      whatever: 'something',
      id: '97a1ca6bda2ebe645a679d29c1e463f7e0196026',
    });
  });
});
