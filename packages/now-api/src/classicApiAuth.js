import { mapKeys } from 'lodash';
import rp from 'request-promise-native';
import { parse as parseCookie } from 'cookie';
import buildUserForContext from './buildContext';
import logger from './logger';

const MEETUP_SELF_QUERY = 'https://api.meetup.com/members/self';

const checkMeetupAuth = async ({ cookies, host, protocol, userAgent }) => {
  // TODO: work with oauth tokens again
  // rebuild a cookie header string from the parsed `cookies` object
  const cookie = ['MEETUP_MEMBER', 'MEETUP_CSRF']
    .map(name => `${name}=${cookies[name]}`)
    .join('; ');
  let meetupUser = null;
  if (cookies.MEETUP_CSRF && cookies.MEETUP_MEMBER) {
    try {
      meetupUser = await rp(MEETUP_SELF_QUERY, {
        headers: {
          cookie,
          'csrf-token': cookies.MEETUP_CSRF,
        },
        json: true,
      });
    } catch (e) {
      logger.info('Meetup auth failed', e);
    }
  }

  return buildUserForContext(
    {
      meetupUser,
      userAgent,
      protocol,
      host,
    },
    { http: true }
  );
};

// lambda

const getAuthInputsFromLambdaRequest = headers => {
  const lcase = mapKeys(headers, (i, k) => k.toLowerCase());
  return {
    cookies: parseCookie(lcase.cookie || ''),
    host: lcase.host,
    protocol: lcase['x-forwarded-proto'],
    userAgent: lcase['user-agent'],
  };
};

const checkMeetupAuthLambda = async headers => {
  const authInputs = getAuthInputsFromLambdaRequest(headers);
  return checkMeetupAuth(authInputs);
};

// express

const getAuthInputsFromExpressRequest = req => ({
  cookies: req.cookies,
  host: req.get('host'),
  protocol: req.protocol,
  userAgent: req.get('User-Agent'),
});

const checkMeetupAuthExpress = async req => {
  const authInputs = getAuthInputsFromExpressRequest(req);
  return checkMeetupAuth(authInputs);
};

export {
  checkMeetupAuthExpress,
  checkMeetupAuthLambda,
  getAuthInputsFromLambdaRequest,
};
export default checkMeetupAuth;
