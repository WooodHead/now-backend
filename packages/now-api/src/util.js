// @flow
import { assignWith, omit, truncate } from 'lodash';
import * as crypto from 'crypto';

export const splitName = (name: string) => {
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
export const promiseDelay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const concatMapOfArrays = (...sources: Array<{}>) =>
  assignWith(
    {},
    ...sources,
    (objValue, srcValue) => (objValue ? objValue.concat(srcValue) : srcValue)
  );

export const putInOrder = (
  objects: Array<{}>,
  ids: Array<string | number>,
  idProp: string = 'id'
) => {
  const lookup = {};
  objects.forEach(obj => {
    if (!obj) {
      lookup.null = null;
    } else {
      lookup[obj[idProp]] = obj;
    }
  });
  return ids.map(id => lookup[id]);
};

// eslint-disable-next-line no-useless-escape
const unicodeSpace = /[\p{Separator}]+/u;

export const ellipsize = (text: string, length: number) =>
  text.length > length
    ? truncate(text, { length, omission: '…', separator: unicodeSpace })
    : text;

export const MIN_IOS = 2479;
export const MIN_ANDROID = 16671;

export type UserAgent = {
  client: string,
  clientVersion: string,
  platform: string,
  osVersion: string,
  buildNumber: number | 'unknown',
};

export const expiredUserAgent = ({
  client,
  platform,
  buildNumber,
}: UserAgent): boolean => {
  if (
    client !== 'Meetup-Now' ||
    buildNumber === 1 ||
    buildNumber === 'unknown'
  ) {
    return false;
  }
  if (platform === 'Ios' && buildNumber < MIN_IOS) {
    return true;
  } else if (platform !== 'Ios' && buildNumber < MIN_ANDROID) {
    return true;
  }

  return false;
};

const USER_AGENT_REGEX = /^([^/]*)\/([^ ]*) ([^/]*)\/([^ ]*) Build ([\d.]+)$/;
export const processUserAgent = (userAgent: string = ''): UserAgent => {
  // Meetup-Now/1.1.0 Ios/11.4 Build 1
  const matched = userAgent.match(USER_AGENT_REGEX);
  // 0:"Meetup-Now/1.1.0 Ios/11.4 Build 1"
  // 1:"Meetup-Now"
  // 2:"1.1.0"
  // 3:"Ios"
  // 4:"11.4"
  // 5:"1"

  if (!matched || matched[1] !== 'Meetup-Now') {
    return {
      client: 'unknown',
      clientVersion: 'unknown',
      platform: 'unknown',
      osVersion: 'unknown',
      buildNumber: 'unknown',
    };
  }

  return {
    client: matched[1],
    clientVersion: matched[2],
    platform: matched[3],
    osVersion: matched[4],
    buildNumber: Number(matched[5]),
  };
};

export const filterHeaders = (headers: {}) => omit(headers, 'authorization');

const NUL = Buffer.from([0x00]);

export const withHashId = <T: {}>(base: T): { ...T, id: string } => {
  const hash = crypto.createHash('sha1');
  Object.entries(base).forEach(([k, v]) => {
    hash.update(k);
    hash.update(NUL);
    hash.update(JSON.stringify(v));
    hash.update(NUL);
  });

  return { ...base, id: hash.digest('hex') };
};

export const sha1 = (str: string): string => {
  const hash = crypto.createHash('sha1');
  hash.update(str);
  return hash.digest('hex');
};
