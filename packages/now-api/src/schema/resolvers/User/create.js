import uuid from 'uuid/v4';
import { isPlainObject, pick } from 'lodash';

import { getUser } from './index';
import { CURRENT_TOS_VERSION } from './tos';
import RunTimeFlags from '../../../RunTimeFlags';
import { InvitationLog } from '../../../db/repos';
import sql, { now } from '../../../db/sql';
import {
  consumeInvitation,
  findValidCode,
  EVENT_INVITE_TYPE,
} from '../Invitation';
import { userIdFromContext } from '../../util';
import { SQL_TABLES, GLOBAL_COMMUNITY_ID } from '../../../db/constants';
import { updatePref as updateFcmPref } from '../../../fcm';
import { notifyEventChange } from '../Event';
import { createMembership } from '../Membership';
import { addUserToWhitelistedCommunities } from '../Community';
import { syncIntercomUser } from '../../../jobs';
import { createRsvp } from '../Rsvp';
import logger from '../../../logger';

const PRE_LOGGED_IN_AUTH0_ID = 'CUV6mTWPcyKmfHTw0DppzuVkb45RRCVN@clients';

const maybeUpdateFcm = (preferences, userId, force = false) => {
  const havePref = preferences && 'newEventNotification' in preferences;
  const pref = havePref ? preferences.newEventNotification : true;
  if (havePref || force) {
    updateFcmPref(pref, userId);
  }
};

const putUser = ({ id, ...otherFields }) =>
  sql(SQL_TABLES.USERS)
    .where({ id })
    .update(otherFields);

export const createUser = async ({
  email,
  firstName,
  lastName,
  bio,
  location,
  meetupId,
  preferences = {},
  invitation,
  loaders,
}) => {
  const newUserId = uuid();
  const newUser = {
    id: newUserId,
    email,
    firstName,
    lastName,
    bio,
    location,
    preferences,
    meetupId,
    createdAt: sql.raw('now()'),
    updatedAt: sql.raw('now()'),
    tosVersion: CURRENT_TOS_VERSION,
  };

  let notifyEventId;
  await sql.transaction(async trx => {
    await trx(SQL_TABLES.USERS).insert(newUser);
    if (invitation) {
      const { id: inviteId, eventId, type } = invitation;
      await consumeInvitation(inviteId, newUserId, trx);
      await InvitationLog.insert({
        inviteeId: newUserId,
        inviteId,
        createdAt: now(),
      }).transacting(trx);

      // All users are members of the global community
      const globalMembership = createMembership(
        newUserId,
        GLOBAL_COMMUNITY_ID,
        trx,
        false
      );

      const whitelistedMemberships = addUserToWhitelistedCommunities(
        newUserId,
        trx
      );

      await Promise.all([globalMembership, whitelistedMemberships]);

      if (type === EVENT_INVITE_TYPE) {
        notifyEventId = eventId;
        // attempt to RSVP the user to the event for which they were invited
        try {
          await createRsvp(
            trx,
            { eventId: invitation.eventId, inviteId, userId: newUserId },
            'add',
            loaders
          );
        } catch (e) {
          logger.error(`Unable to RSVP invited user: ${e}`);
        }
      }
    }

    if (notifyEventId) {
      notifyEventChange(notifyEventId);
    }
  });

  maybeUpdateFcm(preferences, newUserId, true);
  await syncIntercomUser(newUserId);

  return newUser;
};

export const createUserMutation = async (
  root,
  {
    input: {
      email,
      firstName,
      lastName,
      bio,
      location,
      preferences = {},
      invitationCode,
    },
  },
  context
) => {
  if (context.currentUserAuth0Id === PRE_LOGGED_IN_AUTH0_ID) {
    throw new Error('No.');
  }
  if (userIdFromContext(context)) {
    throw new Error('User has already been created.');
  }

  const invitation = invitationCode
    ? await findValidCode(invitationCode)
    : null;
  if (!invitation) {
    const required = await RunTimeFlags.get('require-invite');
    if (required) {
      throw new Error('A valid invitation code is required.');
    }
  }

  const newUser = await createUser({
    email,
    firstName,
    lastName,
    bio,
    location,
    preferences,
    meetupId: context.meetupUserId,
    invitation,
    loaders: context.loaders,
  });

  return { user: getUser(newUser.id, newUser.id) };
};

export const updateCurrentUser = (root, { input }, context) => {
  const id = userIdFromContext(context);
  if (!id) {
    throw new Error('User must be authenticated in order to edit profile');
  }

  const newUser = {
    id,
    ...pick(input, ['firstName', 'lastName', 'bio']),
    updatedAt: sql.raw('now()'),
  };

  if (
    Object.prototype.hasOwnProperty.call(input, 'preferences') &&
    isPlainObject(input.preferences)
  ) {
    // merge existing prefs with provided
    // https://www.postgresql.org/docs/9.6/static/functions-json.html
    newUser.preferences = sql.raw('?? || ?', [
      'preferences',
      input.preferences,
    ]);
  }

  context.loaders.members.clear(id);
  return putUser(newUser)
    .then(() => context.loaders.members.load(id))
    .then(u =>
      syncIntercomUser(id).then(() => {
        maybeUpdateFcm(input.preferences, id);
        return {
          user: u,
        };
      })
    );
};
