import { Instant } from 'js-joda';

import { put, get } from '../../db';
import { userIdFromContext, paginatify } from '../util';

export const getMessages = (root, { eventId, first, last, after, before }) =>
  paginatify(
    {
      expr: 'eventId = :eventId',
      exprValues: { ':eventId': eventId },
      tableName: 'now_messages',
      cursorId: 'ts',
      cursorDeserialize: Number,
    },
    {
      first,
      last,
      after,
      before,
    }
  );

const createMessage = (root, { input: { userId, eventId, text } }, ctx) => {
  const loggedInUserId = userIdFromContext(ctx);
  if (userId !== loggedInUserId) {
    throw new Error('Only the logged in user can create a message');
  }
  // TODO: if user isn't in event, throw error
  if (false) {
    throw new Error("Only users who have Rsvp'd can create messages");
  }
  const ts = Instant.now().toEpochMilli();
  const newMessage = {
    eventId,
    userId,
    text,
    ts,
  };
  return put('now_messages', newMessage).then(() => ({ message: newMessage }));
};

// TODO: cache the event data loader?
const event = message => get('now_event', { id: message.eventId });

export const queries = { eventMessages: getMessages };
export const mutations = { createMessage };
export const resolvers = { event };
