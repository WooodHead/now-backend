import { assignWith, truncate } from 'lodash';
import { ChronoField } from 'js-joda';

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

export const ellipsize = (text, length) =>
  text.length > length
    ? truncate(text, { length, omission: '…', separator: unicodeSpace })
    : text;

export const MIN_IOS = 1980;
export const MIN_ANDROID = 12791;

export const expiredUserAgent = ({ client, platform, buildNumber }) => {
  if (client !== 'Meetup-Now' || buildNumber === 1) {
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
export const processUserAgent = (userAgent = '') => {
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

export const formatTime = when => {
  let time = `${when.get(ChronoField.HOUR_OF_AMPM)}`;
  const minutes = when.get(ChronoField.MINUTE_OF_HOUR);
  if (minutes !== 0) {
    time += ':';
    if (minutes < 10) {
      time += '0';
    }
    time += `${minutes}`;
  }
  time += ' ';
  time += when.get(ChronoField.AMPM_OF_DAY) === 0 ? 'a.m.' : 'p.m.';
  return time;
};
