import { get } from 'lodash';
import fetch from 'node-fetch';
import { splitName } from './util';

const API_BASE = 'https://api.meetup.com/';

const STATEFUL_COUNTRIES = ['us', 'ca'];

const transformUser = u => {
  if (u !== null && u.id) {
    const { email, photo } = u;
    const [firstName, lastName] = splitName(get(u, 'name', ''));
    const locationParts = [u.city];
    if (u.state && STATEFUL_COUNTRIES.includes(u.country)) {
      locationParts.push(u.state);
    }
    return {
      id: String(u.id),
      meetupId: u.id,
      email,
      firstName,
      lastName,
      bio: u.bio || '',
      location: locationParts.join(', '),
      photo: {
        id: get(photo, 'id'),
        highresLink: get(photo, 'highres_link'),
        photoLink: get(photo, 'photo_link'),
        thumbLink: get(photo, 'thumb_link'),
        baseUrl: get(photo, 'base_url'),
        type: get(photo, 'type'),
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
