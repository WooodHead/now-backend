import { messaging } from './client';
import { NEW_EVENTS_TOPIC } from './constants';
import logger from '../logger';
import { getUser } from '../schema/resolvers/User';
import { getDevices } from '../schema/resolvers/Device';

const subOrUnsub = (newPref, tokens) => {
  const op = newPref ? 'subscribeToTopic' : 'unsubscribeFromTopic';
  return messaging[op](tokens, NEW_EVENTS_TOPIC);
};

/*
 * Associates a device with a user, subscribing or unsubscribing the device
 * per the user's preferences.
 */
export const assocDevice = (token, { id, preferences }) => {
  const prefPromise = preferences
    ? Promise.resolve(preferences)
    : getUser(id, id).then(user => user.preferences);
  return prefPromise
    .then(p => {
      // if the preference is true, or not present at all, subscribe. if it's
      // there, and false, unsubscribe.
      const shouldSubscribe = !(p && p.newEventNotification === false);

      return subOrUnsub(shouldSubscribe, [token]);
    })
    .catch(e => logger.warn("couldn't modify user subscription", e));
};

/*
 * When a user changes their preference, subscribe or unsubscribe all their
 * devices per the new preference.
 */
export const updatePref = (newPref, userId) =>
  getDevices(userId).then(devices => {
    if (devices && devices.length > 0) {
      return subOrUnsub(newPref, devices.map(device => device.token));
    }
    return Promise.resolve();
  });
