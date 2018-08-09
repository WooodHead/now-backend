import { Instant } from 'js-joda';
import uuid from 'uuid/v4';

import { userIdFromContext, buildEdge, sqlPaginatify } from '../util';
import { getPubSub } from '../../subscriptions';
import { userDidRsvp } from './Rsvp';
import { notifyEventChange } from './Event';
import { sendChatNotif } from '../../jobs';
import { Message, Rsvp } from '../../db/repos';
import { NOW_BOT_USER_ID, SQL_TABLES } from '../../db/constants';
import sql from '../../db/sql';

const MESSAGE_CURSOR_ID = 'ts';

const unreadMessagesCount = (root, args, context) =>
  sql
    .select(sql.raw('count(*)'))
    .from(SQL_TABLES.RSVPS)
    .innerJoin(SQL_TABLES.MESSAGES, { 'rsvps.eventId': 'messages.eventId' })
    .leftJoin(SQL_TABLES.EVENT_USER_METADATA, {
      'rsvps.eventId': 'eventUserMetadata.eventId',
      'rsvps.userId': 'eventUserMetadata.userId',
    })
    .where({
      'rsvps.userId': userIdFromContext(context),
      'rsvps.action': 'add',
    })
    .andWhere(
      sql.raw('(?? is null or ?? > ??)', [
        'eventUserMetadata.lastReadTs',
        'messages.ts',
        'eventUserMetadata.lastReadTs',
      ])
    )
    .then(([{ count }]) => count);

export const getMessages = (root, { eventId, first, last, after, before }) =>
  sqlPaginatify(MESSAGE_CURSOR_ID, Message.all({ eventId }), {
    cursorDeserialize: Number,
    reverse: true,
    first,
    last,
    after,
    before,
  });

const eventTopicName = eventId => `messages-${eventId}`;
const userTopicName = userId => `user-messages-${userId}`;
const userReadTopicName = userId => `user-read-${userId}`;

const newMessageObject = ({ id, eventId, userId, text }) => ({
  eventId,
  userId,
  text,
  ts: Instant.now().toEpochMilli(),
  id: id || uuid(),
});

const sendMessage = async (newMessage, sendNotification = false) => {
  const potentialMessage = await Message.byId(newMessage.id);
  if (!potentialMessage) {
    const { eventId } = newMessage;
    await Message.insert(newMessage);

    const edge = buildEdge(MESSAGE_CURSOR_ID, newMessage);
    const pubsub = getPubSub();
    pubsub.publish(eventTopicName(eventId), {
      messageAdded: edge,
    });
    notifyEventChange(eventId);
    Rsvp.all({ eventId, action: 'add' })
      .select('userId')
      .then(users =>
        users.forEach(({ userId }) => {
          pubsub.publish(userTopicName(userId), {
            newMessage: edge,
          });
        })
      );

    if (sendNotification) {
      await sendChatNotif(newMessage);
    }

    return newMessage;
  }
  return potentialMessage;
};

const createBotMessage = (root, { input: { eventId, text, id } }) => {
  const newMessage = newMessageObject({
    eventId,
    userId: NOW_BOT_USER_ID,
    text,
    id,
  });

  return sendMessage(newMessage, true).then(message => ({
    edge: buildEdge(MESSAGE_CURSOR_ID, message),
  }));
};

const createUserMessage = async (
  root,
  { input: { eventId, text, id } },
  ctx
) => {
  const loggedInUserId = userIdFromContext(ctx);
  const newMessage = newMessageObject({
    eventId,
    userId: loggedInUserId,
    text,
    id,
  });

  const didRsvp = await userDidRsvp({ eventId, userId: loggedInUserId });
  if (!didRsvp)
    return Promise.reject(
      new Error('You must have RSVPed before you can post a message.')
    );

  const sentMessage = await sendMessage(newMessage, true);

  return { edge: buildEdge(MESSAGE_CURSOR_ID, sentMessage) };
};

const event = (message, args, { loaders }) =>
  loaders.events.load(message.eventId);
const user = ({ userId: id }, args, context) => {
  if (id) {
    return context.loaders.members.load(id);
  }
  return null;
};
const messageAdded = {
  subscribe: (root, { eventId }) =>
    getPubSub().asyncIterator(eventTopicName(eventId)),
};

const newMessageIterator = (root, args, context) =>
  getPubSub().asyncIterator(userTopicName(userIdFromContext(context)));

const newMessage = {
  subscribe: newMessageIterator,
};

const unreadMessagesCountSub = {
  subscribe: (root, args, context) => {
    const userId = userIdFromContext(context);
    return getPubSub().asyncIterator([
      userReadTopicName(userId),
      userTopicName(userId),
    ]);
  },
  resolve: unreadMessagesCount,
};

export const notifyMessagesRead = (userId, eventId) => {
  getPubSub().publish(userReadTopicName(userId), { messagesRead: eventId });
};

export const queries = { unreadMessagesCount };
export const mutations = { createMessage: createUserMessage, createBotMessage };
export const resolvers = { event, user };
export const subscriptions = {
  messageAdded,
  newMessage,
  unreadMessagesCount: unreadMessagesCountSub,
};
