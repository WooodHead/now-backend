// @flow
import { ZonedDateTime, ZoneId } from 'js-joda';

import { createRsvp } from '../schema/resolvers/Rsvp';
import { EVENT_INVITE_TYPE } from '../schema/resolvers/Invitation';
import makeLoaders from '../db/loaders';
import { Invitation, Event } from '../db/repos';
import sql from '../db/sql';
import { notifyEventChange } from '../schema/resolvers/Event';
import { sendRsvpNotif } from '../fcm';

const EXPIRE_MESSAGE =
  'Your friend has not accepted your invite. You will have to join solo if spots are available.';

const rejectExpiredEventInvites = async () => {
  const loaders = makeLoaders({});
  const expiredEventInvites = await Invitation.all({
    type: EVENT_INVITE_TYPE,
    usedAt: null,
  })
    .innerJoin('rsvps', 'invitations.id', 'rsvps.inviteId')
    .where({ action: 'add' })
    .select('invitations.*')
    .where(
      'expiresAt',
      '<=',
      ZonedDateTime.now(ZoneId.UTC)
        .withFixedOffsetZone()
        .toString()
    );

  /* For each expired invite:
   * rsvp matching invite action=remove 
   * rsvp matching inviter action=remove
   * send notification to inviter
   * notify event update 
   */
  const expires = expiredEventInvites.map(async ({ id, eventId, inviterId }) =>
    sql.transaction(async trx => {
      await Event.byId(eventId)
        .transacting(trx)
        .forUpdate();

      // Inviter rsvp
      const inviterRsvpId = await createRsvp(
        trx,
        { eventId, userId: inviterId },
        'expired',
        loaders
      );
      // Invited rsvp placeholder
      await createRsvp(trx, { eventId, inviteId: id }, 'expired', loaders);
      notifyEventChange(eventId);
      await sendRsvpNotif({
        rsvpId: inviterRsvpId,
        eventId,
        text: EXPIRE_MESSAGE,
      });
    })
  );

  await Promise.all(expires);
};

export default rejectExpiredEventInvites;
