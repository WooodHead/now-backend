import { Instant } from 'js-joda';
import uuid from 'uuid/v4';

import { userIdFromContext, buildEdge, sqlPaginatify } from '../util';
import { getPubSub } from '../../subscriptions';
import { userDidRsvp } from './Rsvp';
import { notifyEventChange } from './Event';
import { sendChatNotif } from '../../fcm';
import { Message } from '../../db/repos';

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

const topicName = eventId => `messages-${eventId}`;

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
    .then(() => Message.byId(newMessage.id))
    .then(potentialMessage => {
      if (!potentialMessage) {
        return Message.insert(newMessage).then(() => {
          getPubSub().publish(topicName(eventId), {
            messageAdded: buildEdge(MESSAGE_CURSOR_ID, newMessage),
          });
          notifyEventChange(eventId);
          sendChatNotif(newMessage);
          return newMessage;
        });
      }
      return potentialMessage;
    })
    .then(message => ({ edge: buildEdge(MESSAGE_CURSOR_ID, message) }));
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
    getPubSub().asyncIterator(topicName(eventId)),
};

export const queries = {};
export const mutations = { createMessage };
export const resolvers = { event, user };
export const subscriptions = { messageAdded };
