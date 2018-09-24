import sharp from 'sharp';

import { NOW_IMAGE_BUCKET, s3, streamObject } from './s3';
import logger from './logger';

const CACHE_CONTROL = 'public, max-age=31536000';

const scaleImage = (width, height, originalKey, ext, scaledKey) => {
  let format;
  let formatOpts;
  let ContentType;

  if (ext === 'jpg') {
    format = 'jpeg';
    formatOpts = { quality: 75, progressive: true };
    ContentType = 'image/jpeg';
  } else if (ext === 'webp') {
    format = 'webp';
    formatOpts = { quality: 75 };
    ContentType = 'image/webp';
  } else {
    return Promise.reject(new Error('unsupported type'));
  }

  return s3
    .getObject({ Bucket: NOW_IMAGE_BUCKET, Key: `${originalKey}.jpg` })
    .promise()
    .then(data =>
      sharp(data.Body)
        .resize(Number(width), Number(height))
        .toFormat(format, formatOpts)
        .toBuffer()
    )
    .then(buffer =>
      s3
        .putObject({
          Body: buffer,
          Bucket: NOW_IMAGE_BUCKET,
          ContentType,
          Key: scaledKey,
        })
        .promise()
    );
};

const resizer = ({ params: { width, height, originalKey, ext } }, res) => {
  const scaledKey = `${width}x${height}/${originalKey}.${ext}`;
  const scaledParams = { Bucket: NOW_IMAGE_BUCKET, Key: scaledKey };

  const onError = e => {
    if (e.statusCode === 404) {
      scaleImage(width, height, originalKey, ext, scaledKey)
        .then(() =>
          streamObject(res, scaledParams, () => res.send(500), CACHE_CONTROL)
        )
        .catch(ex => {
          logger.warn(ex);
          res.sendStatus(400);
        });
    } else {
      logger.error('Error loading resized image', {
        originalKey,
        e,
      });
      res.sendStatus(500);
    }
  };

  streamObject(res, scaledParams, onError, CACHE_CONTROL);
};

export default resizer;
