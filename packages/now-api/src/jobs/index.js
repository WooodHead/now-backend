// @flow
import type { $Request, $Response, NextFunction } from 'express';
import { ChronoField, LocalTime } from 'js-joda';

import { promiseDelay } from '../util';
import rejectExpiredEventInvites from './rejectExpiredEventInvites';
import sayHello from './sayHello';
import sendEventReminders from './sendEventReminders';

const jobs: { [string]: () => Promise<any> } = {
  rejectExpiredEventInvites,
  sayHello,
  sendEventReminders,
};

const waitASecond = () => {
  const now = LocalTime.now();
  if (now.get(ChronoField.SECOND_OF_MINUTE) === 59) {
    const delay = 1000 - now.get(ChronoField.MILLI_OF_SECOND);
    console.log(`delaying ${delay}ms before running job`);
    return promiseDelay(delay);
  }
  return Promise.resolve();
};

export default (req: $Request, res: $Response, next: NextFunction) => {
  const { name } = req.params;
  if (Object.prototype.hasOwnProperty.call(jobs, name)) {
    waitASecond()
      .then(() => jobs[name]())
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  } else {
    res.sendStatus(404);
  }
};
