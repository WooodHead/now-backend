import AWS from 'aws-sdk';
import { pick } from 'lodash';

export const NOW_IMAGE_BUCKET = 'nowimageresize-imagebucket-16vl6yhzklwuf';
export const NOW_ADMIN_BUCKET = 'now-admin';

export const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-east-1' });

export const streamObject = (
  res,
  params,
  onError,
  cacheControl = undefined
) => {
  s3.getObject(params)
    .on('httpHeaders', (code, headers) => {
      if (code < 300) {
        res.set(
          pick(
            headers,
            'content-length',
            'last-modified',
            'content-type',
            'etag'
          )
        );
        if (cacheControl) {
          res.set('Cache-Control', cacheControl);
        }
      }
    })
    .createReadStream()
    .on('error', onError)
    .pipe(res);
};
