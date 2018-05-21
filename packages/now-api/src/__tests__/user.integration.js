import gql from 'graphql-tag';
import { use as jsJodaUse } from 'js-joda';
import jsJodaTimezone from 'js-joda-timezone';
import uuid from 'uuid/v4';
import fs from 'fs';
import { pick } from 'lodash';

import { USER_ID, client, newUserClient } from '../db/mock';
import factory from '../db/factory';
import { User } from '../db/repos';
import sql from '../db/sql';
import { SQL_TABLES } from '../db/constants';

jest.mock('../s3', () => ({
  s3: {
    putObject: () => ({
      promise: () => Promise.resolve(),
    }),
  },
}));

jsJodaUse(jsJodaTimezone);

const truncateTables = () => Promise.all([sql(SQL_TABLES.USERS).truncate()]);

const user = factory.build('user', { id: USER_ID });

beforeEach(() =>
  truncateTables().then(() => Promise.all([sql(SQL_TABLES.USERS).insert(user)]))
);
afterEach(() => truncateTables());

describe('user', () => {
  it('returns the current user', async () => {
    const results = client.query({
      query: gql`
        query getUser($id: ID!) {
          user(id: $id) {
            id
            firstName
            lastName
            bio
            location
          }
        }
      `,
      variables: { id: user.id },
    });

    const { data } = await results;
    expect(data).toMatchObject({
      user: {
        __typename: 'User',
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        location: user.location,
      },
    });
  });

  it('creates a user', async () => {
    const authId = uuid();
    const userClient = newUserClient(authId);
    const newUser = factory.build('user');
    const { email, firstName, lastName, bio, location, birthday } = newUser;
    const preferences = {
      pref1: 2,
      pref3: 'A',
      pref5: false,
      pref7: {
        nestedPref: 'foo',
      },
    };
    const res = await userClient.mutate({
      mutation: gql`
        mutation create($input: CreateUserInput) {
          createUser(input: $input) {
            user {
              id
              preferences
            }
          }
        }
      `,
      variables: {
        input: {
          email,
          firstName,
          lastName,
          bio,
          location,
          preferences,
          birthday,
        },
      },
    });

    const { data: { createUser: { user: { id } } } } = res;

    const dbUser = await User.byId(id);
    dbUser.birthday = dbUser.birthday.toISOString();

    expect(dbUser).toMatchObject({
      id,
      email,
      firstName,
      lastName,
      bio,
      location,
      preferences,
      birthday: expect.stringContaining(birthday),
    });
  });

  it('change user photo', async () => {
    const file = fs.createReadStream(`${__dirname}/test.png`);
    const photo = Promise.resolve({ stream: file });
    const res = await client.mutate({
      mutation: gql`
        mutation photo($input: SetProfilePhotoInput) {
          setProfilePhoto(input: $input) {
            user {
              id
              preferences
              photo {
                id
                preview
              }
            }
          }
        }
      `,
      variables: {
        input: {
          photo,
        },
      },
    });

    const {
      data: { setProfilePhoto: { user: { id, photo: returnedPhoto } } },
    } = res;

    expect(pick(returnedPhoto, ['preview', '__typename'])).toMatchSnapshot();

    const dbUser = await User.byId(id);
    expect(pick(dbUser, ['photoPreview'])).toMatchSnapshot();
  });
});
