/* eslint-disable import/prefer-default-export */
import { createHash } from 'crypto';
import sharp from 'sharp';
import streamToPromise from 'stream-to-promise';

import { NOW_IMAGE_BUCKET, s3 } from '../../s3';
import { userIdFromContext } from '../util';

import { getUser, putPhoto } from './User';

const setProfilePhoto = (root, { input: { photo } }, context) => {
  const userId = userIdFromContext(context);
  const photoHash = createHash('md5')
    .update(userId + new Date().getTime())
    .digest('hex');
  const photoKey = `avatar/${photoHash}.jpg`;
  return photo
    .then(upload => streamToPromise(upload.stream))
    .then(buffer =>
      s3
        .putObject({
          Bucket: NOW_IMAGE_BUCKET,
          Key: photoKey,
          Body: buffer,
          ACL: 'public-read',
        })
        .promise()
        .then(() => {
          sharp(buffer)
            .resize(40, 40)
            .toFormat('jpg')
            .toBuffer()
            .then(preview =>
              putPhoto(
                userId,
                photoKey,
                `data:image/jpg;base64,${preview.toString('base64')}`
              )
            )
            .catch(e => {
              console.error('error creating preview', e);
            });
        })
        .then(() => ({ user: getUser(userId, userId) }))
    )
    .catch(e => {
      console.error('error uploading photo', e);
      throw new Error('Error uploading photo');
    });
};

export const mutations = { setProfilePhoto };
