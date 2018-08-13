import express from 'express';
import 'js-joda-timezone';
import morgan from 'morgan';
import sharp from 'sharp';

import { handler as jobs } from './jobs';

import createStatic from './static';
import createGraphql from './graphql';

const isDev = process.env.NODE_ENV === 'development';

// http://sharp.pixelplumbing.com/en/stable/install/#alpine-linux
sharp.cache(false);

const app = express();

// We're behind a proxy and it will read the right data
app.enable('trust proxy');

app.use(morgan('common'));

app.use((req, res, next) => {
  const proto = req.get('X-Forwarded-Proto');
  if (proto && proto !== 'https') {
    res.redirect(301, `https://${req.get('Host')}${req.url}`);
  } else {
    next();
  }
});

if (isDev || process.env.WORKER_NODE === 'true') {
  app.use('/jobs', jobs);
}
createStatic(app);
createGraphql(app);
