// @flow
import enqueue from './enqueue';

export { handler } from './dequeue';
export { enqueue };

export type JobRequestNoDelay = {
  name: string,
  [string]: any,
};

export type JobRequest = {
  delay?: number,
  ...JobRequestNoDelay,
};

export const sendChatNotif = (args: {
  eventId: string,
  userId: string,
  text: string,
}) => enqueue({ ...args, name: 'sendChatNotif' });

export const syncIntercomUser = (userId: string) =>
  enqueue({ name: 'syncIntercomUser', userId });

export const deleteIntercomUser = (userId: string) =>
  enqueue({ name: 'deleteIntercomUser', userId });

export const notifySubmission = (
  submissionId: string,
  body: string,
  user: {}
) => enqueue({ name: 'notifySubmission', submissionId, body, user });
