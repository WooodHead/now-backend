// @flow
import enqueue from './enqueue';

export { handler } from './dequeue';
export { enqueue };

export type JobRequest = {
  name: string,
  [string]: any,
};

export const sendChatNotif = (args: {
  eventId: string,
  userId: string,
  text: string,
}) => enqueue({ ...args, name: 'sendChatNotif' });
