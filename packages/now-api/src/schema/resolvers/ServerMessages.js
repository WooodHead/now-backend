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
      noActivityTitle: 'Stay tuned!',
      noActivityMessage:
        'Tomorrow’s Meetup of the Day will be announced at 8 p.m. Make sure you join before spots fill up!',
      inviteExplain:
        'If you invite a friend, you will reserve both of your spots before everyone else.',
      inviteExpire: 'Your friend’s invite will expire at 9PM',
    };
  },
};
