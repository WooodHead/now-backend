import 'source-map-support/register';
import express from 'express';
import expressWinston from 'express-winston';
import cookieParser from 'cookie-parser';
import 'js-joda-timezone';
import sharp from 'sharp';

import { handler as jobs } from './jobs';

import createStatic from './static';
import createGraphql from './graphql';
import logger from './logger';
import { filterHeaders } from './util';

const isDev = process.env.NODE_ENV === 'development';

// http://sharp.pixelplumbing.com/en/stable/install/#alpine-linux
sharp.cache(false);

const app = express();
// parse cookies so we can read them as an object
app.use(cookieParser());

// We're behind a proxy and it will read the right data
app.enable('trust proxy');

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    requestFilter: (req, propName) =>
      propName === 'headers' ? filterHeaders(req[propName]) : req[propName],
  })
);

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
