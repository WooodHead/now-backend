import { Instant } from 'js-joda';

import { put, getEvent } from '../../db';
import { userIdFromContext, paginatify, buildEdge } from '../util';
import { pubsub } from '../../subscriptions';
import { TABLES } from '../../db/constants';

const MESSAGE_ADDED_TOPIC = 'messageAdded';
const MESSAGE_CURSOR_ID = 'ts';

export const getMessages = (root, { eventId, first, last, after, before }) =>
  paginatify(
    {
      expr: 'eventId = :eventId',
      exprValues: { ':eventId': eventId },
      tableName: TABLES.MESSAGE,
      cursorId: MESSAGE_CURSOR_ID,
      cursorDeserialize: Number,
      queryParamsExtra: { ScanIndexForward: false },
    },
    {
      first,
      last,
      after,
      before,
    }
  );

const createMessage = (root, { input: { eventId, text } }, ctx) => {
  const loggedInUserId = userIdFromContext(ctx);
  // TODO: if user isn't in event, throw error
  if (false) {
    throw new Error("Only users who have Rsvp'd can create messages");
  }
  const ts = Instant.now().toEpochMilli();
  const newMessage = {
    eventId,
    userId: loggedInUserId,
    text,
    ts,
  };
  return put(TABLES.MESSAGE, newMessage).then(() => {
    pubsub.publish(MESSAGE_ADDED_TOPIC, {
      [MESSAGE_ADDED_TOPIC]: buildEdge(MESSAGE_CURSOR_ID, newMessage),
    });
    return { message: newMessage };
  });
};

// TODO: cache the event data loader?
const event = message => getEvent(message.eventId);
const user = ({ userId: id }, args, context) => {
  if (id) {
    return context.loaders.members.load(id);
  }
  return null;
};
const messageAdded = {
  subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
};

export const queries = {};
export const mutations = { createMessage };
export const resolvers = { event, user };
export const subscriptions = { messageAdded };
