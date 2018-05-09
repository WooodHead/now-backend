import sharp from 'sharp';

import { NOW_IMAGE_BUCKET, s3 } from './s3';

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

const streamObject = (res, params, data) => {
  const stream = s3.getObject(params).createReadStream();

  stream.on('error', res.send);

  res.set('Content-Length', data.ContentLength);
  res.set('Last-Modified', data.LastModified);
  res.set('ETag', data.ETag);
  res.set('Cache-Control', 'public, max-age=31536000');

  // Pipe the s3 object to the response
  stream.pipe(res);
};

const resizer = ({ params: { width, height, originalKey } }, res) => {
  const scaledKey = `${width}x${height}/${originalKey}`;
  const scaledParams = { Bucket: NOW_IMAGE_BUCKET, Key: scaledKey };

  s3
    .headObject(scaledParams)
    .promise()
    .catch(e => {
      if (e.statusCode === 404) {
        return scaleImage(width, height, originalKey, scaledKey).catch(
          scalingError => {
            res.send(scalingError);
          }
        );
      }
      res.send(500);
      return undefined;
    })
    .then(data => {
      if (data) {
        streamObject(res, scaledParams, data);
      }
    });
};

export default resizer;
