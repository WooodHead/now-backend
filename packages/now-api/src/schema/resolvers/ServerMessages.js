import { expiredUserAgent } from '../../util';
import { ServerMessages } from '../../db/repos';
import { now } from '../../db/sql';
import { sqlPaginatify } from '../util';

const serverMessages = async (root, args, { userAgent }) => {
  const expiredClient = expiredUserAgent(userAgent);
  const messages = (await ServerMessages.all()).reduce((acc, elt) => {
    acc[elt.key] = elt.text;
    return acc;
  }, {});

  if (expiredClient) {
    return {
      ...messages,
      noActivityTitle: messages.oldClientTitle,
      noActivityMessage:
        userAgent.platform === 'Ios'
          ? messages.oldClientMessageIos
          : messages.oldClientMessageAndroid,
    };
  }

  return messages;
};

const adminMessage = (root, { id }) => ServerMessages.byId(id);

const manyAdminMessages = (root, { ids }) => ServerMessages.batch(ids);

const allAdminMessages = (root, { input }) =>
  sqlPaginatify('key', ServerMessages.all({}), input);

export const queries = {
  serverMessages,
  adminMessage,
  manyAdminMessages,
  allAdminMessages,
};

const updateAdminMessage = (root, { input: { id, text } }) =>
  ServerMessages.update({ id, text, updatedAt: now() })
    .returning('*')
    .then(([m]) => ({ adminMessage: m }));

export const mutations = {
  updateAdminMessage,
};
