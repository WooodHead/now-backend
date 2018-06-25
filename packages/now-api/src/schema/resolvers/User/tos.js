export const CURRENT_TOS_VERSION = '8.0';

export const tosCurrent = ({ tosVersion }) =>
  typeof tosVersion === 'string' ? tosVersion === CURRENT_TOS_VERSION : null;
