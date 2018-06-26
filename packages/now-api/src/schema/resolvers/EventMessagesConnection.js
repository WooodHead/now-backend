import { userIdFromContext } from '../util';
import { EventUserMetadata, Message } from '../../db/repos';

export const queries = {};

const unreadCount = async (root, args, ctx) => {
  const userId = userIdFromContext(ctx);
  const { eventId, count } = root;
  const metadata = await EventUserMetadata.get({ eventId, userId });

  if (metadata) {
    return Message.all({ eventId })
      .where('ts', '>', Number(metadata.lastReadTs))
      .count('ts')
      .then(([{ count: stringCount }]) => Number(stringCount));
  }

  return count();
};

export const resolvers = {
  unreadCount,
};
