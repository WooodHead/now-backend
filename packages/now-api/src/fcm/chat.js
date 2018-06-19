import { messaging } from './client';
import { getTokensForEvent } from './tokens';
import { Activity, Event, User } from '../db/repos';

const getEventAndActivity = eventId =>
  Event.byId(eventId).then(event =>
    Activity.byId(event.activityId).then(activity => ({
      event,
      activity,
    }))
  );

const sendChatNotif = ({ eventId, userId, text }) =>
  Promise.all([
    getTokensForEvent(eventId, 'messagesNotification', [userId]),
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
    .catch(console.warn);

export default sendChatNotif;
