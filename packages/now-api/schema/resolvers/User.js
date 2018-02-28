import { get } from 'lodash';
import { userFromContext } from '../util';
import { getMember } from '../../api';

const transformUser = u => {
  if (u !== null && u.id) {
    const { email, photo } = u;
    const [first, last] = get(u, 'name', '').split(' ');
    return {
      id: u.id,
      meetupId: u.id,
      email,
      first,
      last,
      photo: {
        highresLink: get(photo, 'highres_link'),
        photoLink: get(photo, 'photo_link'),
        thumbLink: get(photo, 'thumb_link'),
      },
    };
  }
  throw new Error('User not found');
};
const user = (root, { id }, context) =>
  getMember(id, context).then(transformUser);

const currentUser = (root, variables, context) => {
  const u = userFromContext(context);
  return transformUser(u);
};
export const queries = { currentUser, user };

export const resolvers = {};
