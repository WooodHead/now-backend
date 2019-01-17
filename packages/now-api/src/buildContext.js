import { filterAttributes, getByMeetupId } from './schema/resolvers/User';
import loaders from './db/loaders';
import { processUserAgent } from './util';

const loaderContext = options => loaders(options);

export default (
  { currentUserId, userAgent = 'Not Set', protocol, host, scope = '' },
  otherContext = {}
) => {
  const context = {
    userAgent: processUserAgent(userAgent),
    ...otherContext,
    currentUserId,
    user: undefined,
    loaders: loaderContext({ currentUserId: null }),
    scopes: [],
    imageUrl: `${protocol}://${host}/images`,
  };

  if (!currentUserId) {
    return Promise.resolve(context);
  }

  return getByMeetupId(currentUserId).then(user => {
    if (user) {
      const loadersWithContext = loaderContext({ currentUserId: user.id });
      loadersWithContext.members.prime(
        user.id,
        filterAttributes(user.id)(user)
      );
      return {
        ...context,
        user,
        loaders: loadersWithContext,
        scopes: scope.split(' '),
      };
    }
    return context;
  });
};
