// @flow
import rp from 'request-promise-native';
import type { ZonedDateTime } from 'js-joda';

import { enqueue } from '.';
import { User } from '../db/repos';
import { SPECIAL_USER_IDS } from '../db/constants';
import logger from '../logger';

const endpoint = 'https://api.intercom.io';
const { INTERCOM_TOKEN: token } = process.env;

const FIELDS = ['id', 'email', 'firstName', 'lastName', 'createdAt'];

const api = ({ path, ...opts }): Promise<Object> => {
  if (!token) {
    logger.warn("Can't talk to intercom because no API key is set.");
    return Promise.resolve({});
  }

  return rp({
    uri: `${endpoint}${path}`,
    json: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...opts,
  });
};

type LimitedUserData = {
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  createdAt: ZonedDateTime,
};

export const updateIntercomUser = ({
  id,
  email,
  firstName,
  lastName,
  createdAt,
}: LimitedUserData) =>
  api({
    path: '/users',
    method: 'POST',
    body: {
      user_id: id,
      email,
      name: `${firstName} ${lastName}`,
      signed_up_at: createdAt.toString(),
    },
  });

const getUser = userId =>
  api({
    path: '/users',
    method: 'GET',
    qs: { user_id: userId },
  });

// delete user request needs an intercom id, but we traffic in db ids, so
// do a GET first
export const deleteIntercomUser = ({
  userId,
}: {
  userId: string,
}): Promise<any> =>
  getUser(userId).then(({ id }) =>
    api({
      path: '/user_delete_requests',
      method: 'POST',
      body: { intercom_user_id: id },
    })
  );

// given a user id, fetch info from DB, then sync to intercom
export const syncIntercomUser = async ({ userId }: { userId: string }) =>
  User.byId(userId)
    .select(FIELDS)
    .then(user => updateIntercomUser(user));

// intercom ratelimit is 500 calls / minute = 8.33 / second. make at most 7 API
// calls per second in this method, so there are a few left over calls for
// other things.
// as SQS limits the delay to 900 seconds, we will need to rethink all this
// when we get towards 6300 users in our database
export const syncAllIntercomUsers = () =>
  User.all()
    .whereNotIn('id', SPECIAL_USER_IDS)
    .select(FIELDS)
    .then(users =>
      Promise.all(
        users.map((user, index) =>
          enqueue({ name: 'updateIntercomUser', delay: index / 7, ...user })
        )
      )
    );
