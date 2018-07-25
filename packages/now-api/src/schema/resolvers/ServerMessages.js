/* eslint-disable import/prefer-default-export */
import { expiredUserAgent } from '../../util';

export const queries = {
  serverMessages: (root, args, { userAgent }) => {
    const expiredClient = expiredUserAgent(userAgent);

    if (expiredClient) {
      return {
        noActivityTitle: "We've updated Meetup Now!",
        noActivityMessage: `Go to the ${
          userAgent.platform === 'Ios' ? 'App Store' : 'Play Store'
        } and download the latest version.`,
      };
    }

    return {
      noActivityTitle: 'Sorry, no meetup today!',
      noActivityMessage:
        'We’re either on vacay or planning something extra special for you.',
    };
  },
};
