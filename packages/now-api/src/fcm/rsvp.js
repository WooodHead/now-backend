import { messaging } from './client';
import { getTokensForRsvp } from './tokens';
import { NOTIFICATION_PREFERENCE_REMINDERS } from '../db/constants';

const sendRsvpNotif = ({ rsvpId, eventId, text }) =>
  getTokensForRsvp(rsvpId, NOTIFICATION_PREFERENCE_REMINDERS).then(tokens => {
    if (tokens.length === 0) {
      return Promise.resolve();
    }
    return messaging.sendToDevice(tokens, {
      notification: {
        body: text,
      },
      data: {
        uri: `meetupnow://now/eventDetails/${eventId}`,
      },
    });
  });

export default sendRsvpNotif;
