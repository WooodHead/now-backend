// @flow

import { Instant } from 'js-joda';
import rp from 'request-promise-native';

export const endpoint = 'https://meetupnow.auth0.com';

const clientId = process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_CLIENT_SECRET;

// timing on the internet is a little imprecise, so let's renew our token a bit
// before we think we absolutely must.
const EXPIRY_FUDGE_FACTOR = 300;

let currentAccessToken: ?Promise<string>;
let currentAccessTokenExpiry: ?Instant; // undefined while in-flight

export const accessToken = (): Promise<string> => {
  if (
    currentAccessToken &&
    (!currentAccessTokenExpiry ||
      currentAccessTokenExpiry.isAfter(Instant.now()))
  ) {
    return currentAccessToken;
  }

  currentAccessTokenExpiry = undefined;
  currentAccessToken = rp({
    method: 'POST',
    uri: `${endpoint}/oauth/token`,
    json: true,
    body: {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: `${endpoint}/api/v2/`,
    },
  }).then(body => {
    currentAccessTokenExpiry = Instant.now().plusSeconds(
      body.expires_in - EXPIRY_FUDGE_FACTOR
    );
    return body.access_token;
  });
  return currentAccessToken;
};
