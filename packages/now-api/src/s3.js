import AWS from 'aws-sdk';

export const NOW_IMAGE_BUCKET = 'nowimageresize-imagebucket-16vl6yhzklwuf';

export const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-east-1' });
