import { get } from 'lodash';
import { filterAttributes, getByAuth0Id } from './schema/resolvers/User';
import loaders from './db/loaders';
import { processUserAgent } from './util';

const loaderContext = options => loaders(options);

export default (req, otherContext = {}) => {
  const currentUserAuth0Id = get(req, ['user', 'sub']);
  const scope = get(req, ['user', 'scope']) || '';
  const context = {
    userAgent: processUserAgent(req && req.get('User-Agent')),
    ...otherContext,
    currentUserAuth0Id,
    user: undefined,
    loaders: loaderContext({ currentUserId: null }),
    scopes: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images`,
  };
  if (!currentUserAuth0Id) {
    return Promise.resolve(context);
  }
  return getByAuth0Id(currentUserAuth0Id).then(user => {
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
