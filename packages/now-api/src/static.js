import path from 'path';
import express from 'express';
import 'js-joda-timezone';

import resizer from './resizer';
import { NOW_ADMIN_BUCKET, streamObject } from './s3';
import logger from './logger';

const isDev = process.env.NODE_ENV === 'development';
export default app => {
  app.get('/i', (req, res) => {
    res.redirect(301, '/invitation');
  });

  app.get('/invite', (req, res) => {
    res.redirect('https://meetupinc.typeform.com/to/mYMKbB');
  });

  app.get(
    '/images/:width(\\d+)x:height(\\d+)/:originalKey([a-z0-9/]+).:ext([a-z]+)',
    resizer
  );

  app.use('/public', express.static('public'));
  app.use('^/$', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/index.html'));
  });
  app.use('^/invitation', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/invitation.html'));
  });
  app.use('^/faq', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/faq.html'));
  });
  app.use('^/favicon.ico$', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/favicon.ico'));
  });

  if (isDev) {
    const ADMIN_ROOT = path.join(process.cwd(), '../now-admin/dist');
    logger.info(`Serving admin from ${ADMIN_ROOT}`);
    app.use('/admin', express.static(ADMIN_ROOT));
  } else {
    logger.info(`Serving admin from s3://${NOW_ADMIN_BUCKET}`);
    app.get('/admin/?:path(*)', ({ params: { path: filePath } }, res) => {
      streamObject(
        res,
        {
          Bucket: NOW_ADMIN_BUCKET,
          Key: filePath || 'index.html',
        },
        () => res.send(404)
      );
    });
  }
};
