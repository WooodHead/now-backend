// @flow
import express from 'express';
import bodyParser from 'body-parser';
import { ChronoField, LocalTime } from 'js-joda';
import type { $Request, $Response, NextFunction } from 'express';

import { promiseDelay } from '../util';
import type { JobRequestNoDelay } from '.';
import rejectExpiredEventInvites from './rejectExpiredEventInvites';
import sayHello from './sayHello';
import sendEventReminders from './sendEventReminders';
import {
  updateIntercomUser,
  syncAllIntercomUsers,
  syncIntercomUser,
  deleteIntercomUser,
} from './intercom';
import sendChatNotif from '../fcm/chat';

const cronjobs: { [string]: ({ [string]: any }) => Promise<any> } = {
  rejectExpiredEventInvites,
  sayHello,
  sendEventReminders,
  syncAllIntercomUsers,
};

const jobs: { [string]: ({ [string]: any }) => Promise<any> } = {
  ...cronjobs,
  sendChatNotif,
  updateIntercomUser,
  syncIntercomUser,
  deleteIntercomUser,
};

export const handler = express();

const waitASecond = () => {
  const now = LocalTime.now();
  if (now.get(ChronoField.SECOND_OF_MINUTE) === 59) {
    const delay = 1000 - now.get(ChronoField.MILLI_OF_SECOND);
    console.log(`delaying ${delay}ms before running job`);
    return promiseDelay(delay);
  }
  return Promise.resolve();
};

handler.use(bodyParser.json({ type: 'application/json' }));

export const handleJob = ({ name, ...args }: JobRequestNoDelay) =>
  jobs[name](args);

// for SQS jobs
handler.post('/', (req, res, next) => {
  const { body } = req;
  if (
    typeof body.name === 'string' &&
    Object.prototype.hasOwnProperty.call(jobs, body.name)
  ) {
    Promise.resolve()
      .then(() => handleJob(body))
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  } else {
    console.error('invalid job', body);
    res.sendStatus(400);
  }
});

// for cron jobs
handler.post('/:name', (req: $Request, res: $Response, next: NextFunction) => {
  const { name } = req.params;
  if (Object.prototype.hasOwnProperty.call(cronjobs, name)) {
    waitASecond()
      .then(() => cronjobs[name]({ name }))
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  } else {
    res.sendStatus(404);
  }
});
