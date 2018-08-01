// @flow
import { NOTIFICATION_PREFERENCE_REMINDERS } from '../db/constants';
import { Activity } from '../db/repos';
import { getTokensForEvent } from './tokens';
import { messaging } from './client';

export default (eventId: string, activityId: string): Promise<any> =>
  Promise.all([
    getTokensForEvent(eventId, NOTIFICATION_PREFERENCE_REMINDERS),
    Activity.byId(activityId),
  ]).then(([tokens, { title }]) => {
    if (tokens.length === 0) {
      return Promise.resolve();
    }
    return messaging.sendToDevice(tokens, {
      notification: {
        body: `${title} is starting in 2 hours!`,
      },
    });
  });
