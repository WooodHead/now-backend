/* eslint-disable import/prefer-default-export */
import AWS from 'aws-sdk';
import streamToPromise from 'stream-to-promise';
import { createHash } from 'crypto';
import sharp from 'sharp';

import { userIdFromContext } from '../util';
import { putPhoto, getUser } from './User';

const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-east-1' });
const NOW_IMAGE_BUCKET = 'nowimageresize-imagebucket-16vl6yhzklwuf';

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
            .then(preview => {
              putPhoto(
                userId,
                photoKey,
                `data:image/jpg;base64,${preview.toString('base64')}`
              );
            });
        })
        .then(() => getUser(userId, userId))
    )
    .catch(() => {
      // TODO: log the actual error somewhere
      throw new Error('Error uploading photo');
    });
};

export const mutations = { setProfilePhoto };
