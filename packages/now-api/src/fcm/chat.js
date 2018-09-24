import { messaging } from './client';
import { getTokensForEvent } from './tokens';
import { Activity, Event, User } from '../db/repos';
import { NOTIFICATION_PREFERENCE_MESSAGES } from '../db/constants';
import logger from '../logger';

const getEventAndActivity = eventId =>
  Event.byId(eventId).then(event =>
    Activity.byId(event.activityId).then(activity => ({
      event,
      activity,
    }))
  );

const sendChatNotif = ({ eventId, userId, text }) =>
  Promise.all([
    getTokensForEvent(eventId, NOTIFICATION_PREFERENCE_MESSAGES, [userId]),
    getEventAndActivity(eventId),
    User.byId(userId),
  ])
    .then(([tokens, { activity: { title: activityTitle } }, { firstName }]) => {
      if (tokens.length === 0) {
        return Promise.resolve();
      }
      return messaging.sendToDevice(tokens, {
        notification: {
          title: activityTitle,
          body: `${firstName}: ${text}`,
        },
        data: {
          uri: `meetupnow://now/eventDetails/${eventId}/chat`,
        },
      });
    })
    .catch(logger.warn);

export default sendChatNotif;
