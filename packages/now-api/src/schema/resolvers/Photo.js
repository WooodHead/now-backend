/* eslint-disable import/prefer-default-export */
import { createHash } from 'crypto';
import sharp from 'sharp';
import streamToPromise from 'stream-to-promise';

import { NOW_IMAGE_BUCKET, s3 } from '../../s3';
import { userIdFromContext } from '../util';

import { getUser, putPhoto } from './User';

const PREVIEW_HEIGHT = 40;

const storePhoto = (file, key, ratio) =>
  file.then(upload => streamToPromise(upload.stream)).then(buffer =>
    sharp(buffer)
      .toFormat('jpg')
      .toBuffer({ resolveWithObject: true })
      .then(({ data: jpegBuffer, info: { height, width } }) => {
        const providedRatio = width / height;

        if (Math.abs(providedRatio - ratio) > 0.01) {
          throw new Error(
            `The provided image didn't have the proper ratio of ${ratio}, instead it was ${providedRatio}`
          );
        }

        s3.putObject({
          Bucket: NOW_IMAGE_BUCKET,
          Key: key,
          Body: jpegBuffer,
          ACL: 'public-read',
        }).promise();
      })
      .then(() =>
        sharp(buffer)
          .resize(PREVIEW_HEIGHT * ratio, PREVIEW_HEIGHT)
          .toFormat('jpg')
          .toBuffer()
          .then(
            (preview =>
              `data:image/jpg;base64,${preview.toString('base64')}`: null)
          )
          .catch(e => {
            console.error('error creating preview', e);
          })
      )
  );

const setProfilePhoto = (root, { input: { photo } }, context) => {
  const userId = userIdFromContext(context);
  const photoHash = createHash('md5')
    .update(userId + new Date().getTime())
    .digest('hex');
  const photoKey = `avatar/${photoHash}.jpg`;
  return storePhoto(photo, photoKey, 1)
    .then(preview => putPhoto(userId, photoKey, preview))
    .then(() => ({ user: getUser(userId, userId) }))
    .catch(e => {
      console.error('error uploading photo', e);
      throw new Error('Error uploading photo');
    });
};

export const setActivityHeaderPhoto = (activityId, headerPhoto) => {
  const photoHash = createHash('md5')
    .update(activityId + new Date().getTime())
    .digest('hex');
  const photoKey = `activity/${photoHash}.jpg`;
  return storePhoto(headerPhoto, photoKey, 1.5)
    .then(preview => ({
      preview,
      key: photoKey,
    }))
    .catch(e => {
      console.error('error uploading photo', e);
      throw new Error('Error uploading photo');
    });
};

export const mutations = { setProfilePhoto };
