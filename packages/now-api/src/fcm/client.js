/* eslint-disable import/prefer-default-export */
import * as admin from 'firebase-admin';

const credential = admin.credential.cert(
  require('../../meetupnow-google.json')
);

admin.initializeApp({
  credential,
  databaseURL: 'https://meetupnow-190320.firebaseio.com',
});

export const messaging = admin.messaging();
