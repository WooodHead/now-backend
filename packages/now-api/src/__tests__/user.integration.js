import gql from 'graphql-tag';
import uuid from 'uuid/v4';
import fs from 'fs';
import { pick } from 'lodash';
import { ZonedDateTime } from 'js-joda';

import { USER_ID, client, newUserClient } from '../db/mock';
import factory from '../db/factory';
import { Invitation, User } from '../db/repos';
import sql from '../db/sql';
import { SQL_TABLES } from '../db/constants';
import { mutations as InviteMutations } from '../schema/resolvers/Invitation';

jest.mock('../s3', () => ({
  s3: {
    putObject: () => ({
      promise: () => Promise.resolve(),
    }),
  },
}));

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.USERS).truncate(),
    sql(SQL_TABLES.INVITATIONS).truncate(),
  ]);

const user = factory.build('user', { id: USER_ID });

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([sql(SQL_TABLES.USERS).insert(user)])
  ));
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
    const invitationCodeResult = await InviteMutations.createAppInvitation(
      {},
      { input: { notes: 'test', expiresAt: ZonedDateTime.now().plusHours(1) } },
      { user: { id: '00000000-0000-0000-0000-000000000000' } }
    );
    const invitation = await invitationCodeResult.invitation;
    const { code: invitationCode } = invitation;

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
          invitationCode,
        },
      },
    });

    const {
      data: {
        createUser: {
          user: { id },
        },
      },
    } = res;

    const dbUser = await User.byId(id);
    dbUser.birthday = dbUser.birthday.toString();

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

    const dbInvititation = await Invitation.get({ id: invitation.id });
    expect(dbInvititation.code).toEqual(invitationCode);
    expect(dbInvititation.usedAt).toBeTruthy();
    expect(dbInvititation.inviteeId).toEqual(dbUser.id);
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
      data: {
        setProfilePhoto: {
          user: { id, photo: returnedPhoto },
        },
      },
    } = res;

    expect(pick(returnedPhoto, ['preview', '__typename'])).toMatchSnapshot();

    const dbUser = await User.byId(id);
    expect(pick(dbUser, ['photoPreview'])).toMatchSnapshot();
  });

  it.each([
    [
      'A bio.\nWith linebreaks.\nBetween sentences.', // User input
      'A bio. With linebreaks. Between sentences.', // Desired output
    ],
    [
      'A bio with a lot \n\n\n\n\n of empty space.',
      'A bio with a lot of empty space.',
    ],
    ['A bio   with   uneven   spaces.', 'A bio with uneven spaces.'],
    ['\n\n\n\n\n\n\n', null],
    ['', null],
  ])(
    'removes linebreaks and extra spaces from new user bio',
    async (userInput, desiredOutput) => {
      const userId = uuid();
      const bioUser = factory.build('user', { id: userId, bio: userInput });
      await sql(SQL_TABLES.USERS).insert(bioUser);

      const results = await client.query({
        query: gql`
          query getUser($id: ID!) {
            user(id: $id) {
              bio
            }
          }
        `,
        variables: { id: userId },
      });

      const { data } = await results;
      expect(data.user.bio).toEqual(desiredOutput);
    }
  );
});
