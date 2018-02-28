import { slice } from 'lodash';
import { Instant } from 'js-joda';

import { query, put, get } from '../../db';
import { userIdFromContext } from '../util';

export const getMessages = async (
  root,
  { eventId, first, last, after, before }
) => {
  let expr = 'eventId = :eventId';
  const pageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
  };
  const exprValues = { ':eventId': eventId };
  if (after) {
    expr += ' and ts > :after';
    exprValues[':after'] = Number(after);
  }

  if (before) {
    expr += ' and ts < :before';
    exprValues[':before'] = Number(before);
  }
  const params = {
    TableName: 'now_messages',
    KeyConditionExpression: expr,
    ExpressionAttributeValues: exprValues,
  };
  const serverMessages = await query(params);

  let messages = serverMessages;
  if (first <= 0) {
    throw new Error('first must be greater than 0');
  } else if (first !== undefined) {
    messages = slice(serverMessages, 0, first);
    pageInfo.hasNextPage = messages.length < serverMessages.length;
  }
  if (last <= 0) {
    throw new Error('last must be greater than 0');
  } else if (last !== undefined) {
    messages = slice(serverMessages, -last);
    pageInfo.hasPreviousPage = messages.length < serverMessages.length;
  }
  return {
    pageInfo,
    edges: messages.map(m => ({ cursor: `${m.ts}`, node: m })),
  };
};

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
