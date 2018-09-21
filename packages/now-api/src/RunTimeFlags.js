// @flow
/*
 * "Run-time" flags. Currently this is a naïve implementation which is in fact
 * configurable only at build time, but everything returns a Promise so we can
 * move to a more sophisticated implementation later.
 */

const values = {
  'require-invite': false,
};

export default {
  get: (key: string): Promise<boolean> => {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      return Promise.resolve(values[key]);
    }
    return Promise.reject(new Error(`unknown run time flag ${key}`));
  },
};
