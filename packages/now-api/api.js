/* eslint-disable import/prefer-default-export,no-unused-vars */
import { get, isArray, isBoolean } from 'lodash';
import fetch from 'node-fetch';
import FormData from 'form-data';
import streamToPromise from 'stream-to-promise';

const API_BASE = 'https://api.meetup.com/';

const transformPhoto = photo => ({
  id: get(photo, 'id'),
  highresLink: get(photo, 'highres_link'),
  photoLink: get(photo, 'photo_link'),
  thumbLink: get(photo, 'thumb_link'),
  baseUrl: get(photo, 'base_url'),
  type: get(photo, 'type'),
});

const extractErrors = (status, { errors }) => {
  if (isArray(errors) && errors.length > 0) {
    return Promise.reject(
      new Error(errors.map(({ message }) => message).join(', '))
    );
  }
  return Promise.reject(new Error(`API Status ${status}`));
};

const parseResponse = response =>
  response.ok
    ? response.json()
    : response.json().then(json => extractErrors(response.status, json));

const apiGet = (path, context) =>
  fetch(`${API_BASE}${path}?access_token=${get(context, 'token')}`).then(
    parseResponse
  );

const apiMultipart = (path, context, fields) => {
  const form = new FormData({ maxDataSize: 10 * 1024 * 1024 });
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'object') {
      form.append(key, value, 'file.jpeg');
    } else {
      form.append(key, value);
    }
  });
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${get(context, 'token')}` },
    body: form,
  }).then(parseResponse);
};

export const setProfilePhoto = (photo, main, syncPhoto, context) =>
  photo
    .then(upload => streamToPromise(upload.stream))
    .then(buffer => {
      const fields = {
        photo: buffer,
      };
      if (isBoolean(main)) {
        fields.main = String(main);
      }
      if (isBoolean(syncPhoto)) {
        fields.sync_photo = String(syncPhoto);
      }
      return apiMultipart('members/self/photos', context, fields);
    })
    .then(response => ({
      photo: transformPhoto(response),
    }));
