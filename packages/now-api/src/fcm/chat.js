import { messaging } from './client';
import { getTokensForEvent } from './tokens';
import { get, getEvent, TABLES } from '../db';

const getEventAndActivity = eventId =>
  getEvent(eventId).then(event =>
    get(TABLES.ACTIVITY, { id: event.activityId }).then(activity => ({
      event,
      activity,
    }))
  );

const getUser = userId => get(TABLES.USER, { id: userId });

const sendChatNotif = ({ eventId, userId, text }) =>
  Promise.all([
    getTokensForEvent(eventId, 'messagesNotification', [userId]),
    getEventAndActivity(eventId),
    getUser(userId),
  ])
    .then(
      ([
        tokens,
        { activity: { title: activityTitle, emoji } },
        { firstName },
      ]) => {
        if (tokens.length === 0) {
          return Promise.resolve();
        }
        return messaging.sendToDevice(tokens, {
          notification: {
            body: `${emoji} ${activityTitle.substr(
              0,
              20
            )} @${firstName}: ${text}`,
          },
        });
      }
    )
    .catch(console.warn);

export default sendChatNotif;
