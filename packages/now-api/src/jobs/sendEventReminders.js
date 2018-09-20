// @flow
import { Duration, Instant } from 'js-joda';
import { Event } from '../db/repos';
import { logSentNotification, sendEventReminder } from '../fcm';

const NOTIF_SEND_TIME = Duration.ofHours(2); // if you change this, consider also changing the notif text
const KEY = 'event_reminder';

const sendEventReminders = async (): Promise<void> => {
  const now = Instant.now();
  const eventStartTime = now.plus(NOTIF_SEND_TIME);

  const events = await Event.all()
    .where('time', '>=', now.toString())
    .where('time', '<=', eventStartTime.toString())
    .whereNotNull('visibleAt')
    .select('id', 'activityId');

  await Promise.all(
    events.map(({ id, activityId }) =>
      logSentNotification(id, KEY).then(
        () => sendEventReminder(id, activityId).catch(console.warn),
        () => {
          /* already sent notifications are ok, do nothing */
        }
      )
    )
  );
};

export default sendEventReminders;
