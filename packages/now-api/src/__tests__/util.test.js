import { splitName } from '../util';

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
