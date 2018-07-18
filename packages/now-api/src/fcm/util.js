/* eslint-disable import/prefer-default-export */

export const validUserPref = prefName => ({ preferences }) =>
  !(preferences && preferences[prefName] === false);
