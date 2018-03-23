// eslint-disable-next-line import/prefer-default-export
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
