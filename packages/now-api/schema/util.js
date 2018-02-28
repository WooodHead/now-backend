import { get } from 'lodash';

export const userIdFromContext = context => get(context, ['user', 'id']);
export const userFromContext = context => get(context, ['user']);
