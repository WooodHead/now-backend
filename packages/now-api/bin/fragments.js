/* eslint-disable no-underscore-dangle,no-console,no-param-reassign,import/no-extraneous-dependencies */

// https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher

require('babel-register');

const rp = require('request-promise-native');
const fs = require('fs');
// eslint-disable-next-line import/no-unresolved
const defaultAuthToken = require('../../now-mobile/src/apollo/defaultAuthToken');

rp({
  uri: `http://localhost:3000/graphql`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${defaultAuthToken.default}`,
  },
  json: true,
  body: {
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  },
}).then(result => {
  // here we're filtering out any type information unrelated to unions or interfaces
  const filteredData = result.data.__schema.types.filter(
    type => type.possibleTypes !== null
  );
  result.data.__schema.types = filteredData;
  fs.writeFile(
    `${__dirname}/../src/db/fragmentTypes.json`,
    JSON.stringify(result.data),
    err => {
      if (err) {
        console.error('Error writing fragmentTypes file', err);
      } else {
        console.log('Fragment types successfully extracted!');
      }
    }
  );
});
