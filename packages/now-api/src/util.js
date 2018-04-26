import { assignWith, truncate } from 'lodash';

export const splitName = name => {
  const re = /[\s]+/;
  const match = re.exec(name);

  return match
    ? [
        name.substring(0, match.index),
        name.substring(match.index + match[0].length),
      ]
    : [name];
};

export const isDev = () => process.env.NODE_ENV === 'development';

/** Returns a promise which will resolve after the specified number of milliseconds */
export const promiseDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

export const concatMapOfArrays = (...sources) =>
  assignWith(
    {},
    ...sources,
    (objValue, srcValue) => (objValue ? objValue.concat(srcValue) : srcValue)
  );

export const putInOrder = (objects, ids, idProp = 'id') => {
  const lookup = {};
  objects.forEach(obj => {
    lookup[obj[idProp]] = obj;
  });
  return ids.map(id => lookup[id]);
};

// eslint-disable-next-line no-useless-escape
const unicodeSpace = /[\p{Separator}]+/u;

export const ellipsize = (text, length) =>
  text.length > length
    ? truncate(text, { length, omission: '…', separator: unicodeSpace })
    : text;
