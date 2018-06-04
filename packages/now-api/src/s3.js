import AWS from 'aws-sdk';

export const NOW_IMAGE_BUCKET = 'nowimageresize-imagebucket-16vl6yhzklwuf';
export const NOW_ADMIN_BUCKET = 'now-admin';

export const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-east-1' });

export const streamObject = (res, params, data, cacheControl = '') => {
  const stream = s3.getObject(params).createReadStream();

  stream.on('error', res.send);

  res.set('Content-Length', data.ContentLength);
  res.set('Last-Modified', data.LastModified);
  res.set('ETag', data.ETag);
  res.set('Cache-Control', cacheControl);

  // Pipe the s3 object to the response
  stream.pipe(res);
};
