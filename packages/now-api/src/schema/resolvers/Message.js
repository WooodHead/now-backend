import { Instant } from 'js-joda';
import { withFilter } from 'graphql-subscriptions';
import uuid from 'uuid/v4';

import { get, getEvent, put } from '../../db';
import { userIdFromContext, paginatify, buildEdge } from '../util';
import { getPubSub } from '../../subscriptions';
import { TABLES } from '../../db/constants';
import { userDidRsvp } from './Rsvp';
import { sendChatNotif } from '../../fcm';

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
      queryParamsExtra: {
        IndexName: 'eventId-ts-index',
        ScanIndexForward: false,
      },
    },
    {
      first,
      last,
      after,
      before,
    }
  );

/* If trying to post a message failed because it already exists, see if it's
 * because the message was already posted recently. If so, idempotently
 * allow the same message to be returned.
 */
const existingMessage = message =>
  get(TABLES.MESSAGE, { id: message.id }).then(
    dbMessage =>
      message.eventId === dbMessage.eventId &&
      message.userId === dbMessage.userId &&
      message.text === dbMessage.text
        ? dbMessage
        : Promise.reject(new Error('Duplicate message ID'))
  );

const createMessage = (root, { input: { eventId, text, id } }, ctx) => {
  const loggedInUserId = userIdFromContext(ctx);
  const ts = Instant.now().toEpochMilli();
  const newMessage = {
    eventId,
    userId: loggedInUserId,
    text,
    ts,
    id: id || uuid(),
  };

  return userDidRsvp({ eventId, userId: loggedInUserId })
    .then(didRsvp => {
      if (!didRsvp)
        return Promise.reject(
          new Error('You must have RSVPed before you can post a message.')
        );

      return true;
    })
    .then(() => put(TABLES.MESSAGE, newMessage, 'attribute_not_exists(id)'))
    .then(() => {
      getPubSub().publish(MESSAGE_ADDED_TOPIC, {
        [MESSAGE_ADDED_TOPIC]: buildEdge(MESSAGE_CURSOR_ID, newMessage),
      });
      sendChatNotif(newMessage);
      return newMessage;
    })
    .catch(
      e =>
        e.code === 'ConditionalCheckFailedException'
          ? existingMessage(newMessage)
          : Promise.reject(e)
    )
    .then(message => ({ edge: buildEdge(MESSAGE_CURSOR_ID, message) }));
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
  subscribe: withFilter(
    () => getPubSub().asyncIterator(MESSAGE_ADDED_TOPIC),
    (payload, variables) =>
      payload.messageAdded.node.eventId === variables.eventId
  ),
};

export const queries = {};
export const mutations = { createMessage };
export const resolvers = { event, user };
export const subscriptions = { messageAdded };
