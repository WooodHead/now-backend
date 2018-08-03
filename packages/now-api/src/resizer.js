import sharp from 'sharp';

import { NOW_IMAGE_BUCKET, s3, streamObject } from './s3';

const scaleImage = (width, height, originalKey, scaledKey) =>
  s3
    .getObject({ Bucket: NOW_IMAGE_BUCKET, Key: originalKey })
    .promise()
    .then(data =>
      sharp(data.Body)
        .resize(Number(width), Number(height))
        .toFormat('png')
        .toBuffer()
    )
    .then(buffer =>
      s3
        .putObject({
          Body: buffer,
          Bucket: NOW_IMAGE_BUCKET,
          ContentType: 'image/png',
          Key: scaledKey,
        })
        .promise()
    );

const resizer = ({ params: { width, height, originalKey } }, res) => {
  const scaledKey = `${width}x${height}/${originalKey}`;
  const scaledParams = { Bucket: NOW_IMAGE_BUCKET, Key: scaledKey };

  s3.headObject(scaledParams)
    .promise()
    .catch(e => {
      if (e.statusCode === 404) {
        return scaleImage(width, height, originalKey, scaledKey).catch(
          scalingError => {
            res.send(scalingError);
          }
        );
      }
      console.error(
        `Error loading resized image key=%s, error=%s`,
        originalKey,
        e
      );
      res.send(500);
      return undefined;
    })
    .then(data => {
      if (data) {
        streamObject(res, scaledParams, data, 'public, max-age=31536000');
      }
    });
};

export default resizer;
