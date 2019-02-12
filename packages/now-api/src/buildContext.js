import { filterAttributes, getByMeetupId } from './schema/resolvers/User';
import { createUser } from './schema/resolvers/User/create';
import loaders from './db/loaders';
import { processUserAgent } from './util';

const loaderContext = options => loaders(options);

export default async (
  { meetupUser, userAgent = 'Not Set', protocol, host },
  otherContext = {}
) => {
  const meetupUserId = meetupUser ? meetupUser.id : null;

  let context = {
    userAgent: processUserAgent(userAgent),
    ...otherContext,
    meetupUserId,
    user: undefined,
    loaders: loaderContext({ currentUserId: null }),
    scopes: [],
    imageUrl: `${protocol}://${host}/images`,
  };

  if (meetupUserId) {
    let user = await getByMeetupId(meetupUserId);

    if (!user) {
      // create user
      await createUser({
        email: meetupUser.email,
        firstName: meetupUser.name, // TODO split it later maybe?
        bio: meetupUser.bio,
        meetupId: meetupUser.id,
        loaders: loaders(),
      });
      user = await getByMeetupId(meetupUserId);
    }

    const loadersWithContext = loaderContext({ currentUserId: user.id });
    loadersWithContext.members.prime(user.id, filterAttributes(user.id)(user));
    context = {
      ...context,
      user,
      loaders: loadersWithContext,
      scopes: user.scope ? user.scope.split(' ') : [],
    };
  }

  return Promise.resolve(context);
};
