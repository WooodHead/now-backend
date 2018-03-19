import { get } from 'lodash';
import fetch from 'node-fetch';

const API_BASE = 'https://api.meetup.com/';

const transformUser = u => {
  if (u !== null && u.id) {
    const { email, photo } = u;
    const [first, last] = get(u, 'name', '').split(' ');
    return {
      id: String(u.id),
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
  return null;
};

const apiGet = (path, context) =>
  fetch(`${API_BASE}${path}?access_token=${get(context, 'token')}`).then(resp =>
    resp.json()
  );
export const getSelf = context =>
  apiGet('members/self', context).then(transformUser);

export const getMember = (id, context) =>
  apiGet(`members/${id}`, context).then(transformUser);
