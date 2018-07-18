// @flow
import type { $Request, $Response, NextFunction } from 'express';
import rejectExpiredEventInvites from './rejectExpiredEventInvites';
import sayHello from './sayHello';

const jobs: { [string]: () => Promise<any> } = {
  rejectExpiredEventInvites,
  sayHello,
};

export default (req: $Request, res: $Response, next: NextFunction) => {
  const { name } = req.params;
  if (Object.prototype.hasOwnProperty.call(jobs, name)) {
    jobs[name]()
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  } else {
    res.sendStatus(404);
  }
};
