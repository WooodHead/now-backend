/* eslint-disable import/prefer-default-export */
import { partition } from 'lodash';

import { userIdFromContext } from '../../util';
import { deleteUser } from '../../../auth0';
import sql from '../../../db/sql';
import {
  Device,
  Event,
  EventUserMetadata,
  Message,
  Rsvp,
  RsvpLog,
  User,
} from '../../../db/repos';
import { notifyEventChange } from '../Event';
import { SQL_TABLES, DELETED_USER_ID } from '../../../db/constants';

// if the user is RSVPed to events which haven't started yet, release
// their spots for someone else to claim. for events in the past (or
// present), you can't grab the spot, so just up the deleted users count
const cleanUpEvents = async (trx, userId) => {
  const rsvps = await Rsvp.withTransaction(trx)
    .all({ userId })
    .innerJoin('events', 'rsvps.eventId', 'events.id')
    .column('rsvps.eventId', { past: trx.raw('?? < now()', 'events.time') });
  const [pastEvents, futureEvents] = partition(rsvps, ({ past }) => past);
  await Promise.all([
    trx(Event.table)
      .whereIn('id', pastEvents.map(({ eventId }) => eventId))
      .update('deletedUsers', trx.raw('?? + 1', 'deletedUsers')),
    trx(Event.table)
      .whereIn('id', futureEvents.map(({ eventId }) => eventId))
      .update('going', trx.raw('greatest(?? - 1, 0)', 'going')),
  ]);
  return rsvps.map(({ eventId }) => eventId);
};

export const deleteCurrentUser = (root, { id: inputId }, context) => {
  const userId = userIdFromContext(context);
  if (inputId && inputId !== userId) {
    throw new Error('You can’t delete other users’ accounts!');
  }

  const auth0Id = context.currentUserAuth0Id;

  return (
    deleteUser(auth0Id)
      .then(() =>
        sql.transaction(async trx => {
          await Device.withTransaction(trx).delete({ userId });
          const eventIds = await cleanUpEvents(trx, userId);
          await Promise.all([
            EventUserMetadata.withTransaction(trx).delete({ userId }),
            Rsvp.withTransaction(trx).delete({ userId }),
            RsvpLog.withTransaction(trx)
              .all({ userId })
              .update({ userId: DELETED_USER_ID }),
            Message.withTransaction(trx)
              .all({ userId })
              .update({ userId: DELETED_USER_ID }),
            trx(SQL_TABLES.BLOCKED_USERS)
              .where({ blockerId: userId })
              .orWhere({ blockedId: userId })
              .del(),
            trx(SQL_TABLES.INVITATIONS)
              .where({ inviterId: userId })
              .orWhere({ inviteeId: userId })
              .del(),
          ]);
          await User.delete({ id: userId });
          await trx.commit();

          eventIds.forEach(id => notifyEventChange(id));
        })
      )
      // TODO: catch errors here and do something useful with them, rather than echoing to the client
      .then(() => userId)
  );
};
