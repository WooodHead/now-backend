/* eslint-disable import/prefer-default-export */
export const parseDate = date =>
  date === null ? null : new Date(parseInt(date, 10));
