import { Instant } from 'js-joda';
import uuid from 'uuid/v4';

import { userIdFromContext, buildEdge, sqlPaginatify } from '../util';
import { getPubSub } from '../../subscriptions';
import { userDidRsvp } from './Rsvp';
import { notifyEventChange } from './Event';
import { sendChatNotif } from '../../fcm';
import { Message, Rsvp } from '../../db/repos';
import { NOW_BOT_USER_ID } from '../../db/constants';

const MESSAGE_CURSOR_ID = 'ts';

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
      sendChatNotif(newMessage);
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

const newMessage = {
  subscribe: (root, args, context) =>
    getPubSub().asyncIterator(userTopicName(userIdFromContext(context))),
};

export const queries = {};
export const mutations = { createMessage: createUserMessage, createBotMessage };
export const resolvers = { event, user };
export const subscriptions = { messageAdded, newMessage };
