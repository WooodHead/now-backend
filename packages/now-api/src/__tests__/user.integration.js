import gql from 'graphql-tag';
import uuid from 'uuid/v4';
import fs from 'fs';
import { pick } from 'lodash';
import { ZonedDateTime } from 'js-joda';

import { USER_ID, client, newUserClient, setAdmin } from '../db/mock';
import factory from '../db/factory';
import { CommunityWhitelist, Invitation, User, Membership } from '../db/repos';
import sql from '../db/sql';
import { SQL_TABLES, GLOBAL_COMMUNITY_ID } from '../db/constants';
import { mutations as InviteMutations } from '../schema/resolvers/Invitation';

jest.mock('../s3', () => ({
  s3: {
    putObject: () => ({
      promise: () => Promise.resolve(),
    }),
  },
}));

const MACOS_PHOTO =
  'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoACgDASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAABAAFAwYB/8QAMRAAAgEDAwMCAgkFAAAAAAAAAQIDAAQRBRIhEzFRQWEGoRQVIiQycYHB0SMzUpGx/8QAGQEAAgMBAAAAAAAAAAAAAAAAAwQAAgUB/8QAHREAAgMAAwEBAAAAAAAAAAAAAQIAAxEEIUESIv/aAAwDAQACEQMRAD8ATLf3utlrfTYMQMdryvwp9s+v5D/YpFroH1bch7oGWRP7bYG1fTgDgH5jzWxMptNOnvBD/QtE3ED7Pb0FY7/FOmTzwxJFLD1NxYsoxuzySR/2oSAw0y6qzIfkTSjaISgzbhGOTt7n2r5ql2rXIS1jUQx4Ge5bdyMUe9fpWzyjt+FB/kx7fpR9Gs5pI5LW5md53XerHz4/TjigXW9/nyN8bjjNs9ihLtYg8EHBqo05wgZ2w4+yy+cev7VUaqwOuxW+k1P8+QmqfFGozrNpEfSisF3fSJWjJZhngZzx28V5NI4zbS3jzR7CSUYPyOf4Hzpl5GlwD9Ma6k3SMHiijwJCPcDjPijXdnbKI727kgxEu1LdOSh8Nx3/AIoBOzRRQg6nvZLaMadbQDCxm3xGG5G7AA+RNcenLpumxsuFunkLon4sZzx57YFZnwvq+sPpe90hkjhxtLjDqDnH51oWkF1d6vbahczqSquWjHCxkHH7GlipEZDbDLqK6tJF9ymhkJ2uzoV2HwfNVMth90RSDumusx54JAOSR7d6qZoAw9TP5hIYdzN0i3tr281COSNspMGUq5U7SuPQ+1Ok+F7Y2zxRNgMxbEq78E+ueD86qqIgBUQFjsrnDOlppAsIn6cnWlkI37+FYAYCgegFdUsbl4nitFjsxJy7El2J8VVVVkUmdXkWAZsbZ6W0UvVmm60uNoO3aqDwo9KqqqsOhggmYsdM/9k=';

const LINUX_PHOTO =
  'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoACgDASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAABAAFAwYB/8QAMRAAAgEDAwMCAgkFAAAAAAAAAQIDAAQRBRIhEzFRQWEGoRQVIiQycYHB0SMzUpGx/8QAGQEAAgMBAAAAAAAAAAAAAAAAAwQAAgUB/8QAHREAAgMAAwEBAAAAAAAAAAAAAQIAAxEEIUESIv/aAAwDAQACEQMRAD8ATLf3utlrfTYMQMdryvwp9s+v5D/YpFroH1bch7oGWRP7bYG1fTgDgH5jzWxMptNOnvBD/QtE3ED7Pb0FY7/FOmTzwxJFLD1NxYsoxuzySR/2oSAw0y6qzIfkTSjaISgzbhGOTt7n2r5ql2rXIS1jUQx4Ge5bdyMUe9fpWzyjt+FB/kx7fpR9Gs5pI5LW5md53XerHz4/TjigXW9/nyN8bjjNs9EUJdrEHgg4NVGnOEDO2HH2WXzj1/aqjVWB12K30mp/nyE1T4o1GdZtIj6UVgu76RK0ZLMM8DOeO3ivJpHGbaW8eaPYSSjB+Rz/AAPnTLyNLgH6Y11JukYPFFHgSEe4HGfFGu7O2UR3t3JBiJdqW6clD4bjv/FAJ2aKKEHU97JbRjTraAYWM2+Iw3I3YAHyJrj05dN02Nlwt08hdE/FjOePPbArM+F9X1h9L3ukMkcONpcYdQc4/OtC0gurvV7bULmdSVVy0Y4WMg4/Y0sVIjIbYZdRXVpIvuU0MhO12dCuw+D5qplsPuiKQd011mPPBIBySPbvVTNAGHqZ/MJDDuZukW9te3moRyRtlJgylXKnaVx6H2p0nwvbG2eKJsBmLYlXfgn1zwfnVVREAKiAsdlc4Z0tNIFhE/Tk60shG/fwrADAUD0ArqljcvE8VosdmJOXYkuxPiqqqtWpnV5FgGbG2eltFL1ZputLjaDt2qg8KPSqqqrDoYIJmLHTP//Z';

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.USERS).truncate(),
    sql(SQL_TABLES.MEMBERSHIPS).truncate(),
    sql(SQL_TABLES.INVITATIONS).truncate(),
    sql(SQL_TABLES.INVITATION_LOG).truncate(),
  ]);

const user = factory.build('user', { id: USER_ID });
const anotherUser = factory.build('user');

beforeEach(() =>
  truncateTables().then(() =>
    Promise.all([sql(SQL_TABLES.USERS).insert([user, anotherUser])])
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
    const { email, firstName, lastName, bio, location } = newUser;
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

    expect(dbUser).toMatchObject({
      id,
      email,
      firstName,
      lastName,
      bio,
      location,
      preferences,
    });

    const dbMemberships = await Membership.all({
      userId: id,
      communityId: GLOBAL_COMMUNITY_ID,
    });

    expect(dbMemberships).toHaveLength(1);
    expect(dbMemberships[0]).toMatchObject({ userId: id });

    const dbInvititation = await Invitation.get({ id: invitation.id });
    expect(dbInvititation.code).toEqual(invitationCode);
    expect(dbInvititation.usedAt).toBeTruthy();
    expect(dbInvititation.inviteeId).toEqual(dbUser.id);
  });

  it('creates a user whitelisted for a private community', async () => {
    const authId = uuid();
    const userClient = newUserClient(authId);
    const newUser = factory.build('user');
    const { email, firstName, lastName, bio, location } = newUser;

    const privateCommunityId = uuid();
    await CommunityWhitelist.insert({ email, communityId: privateCommunityId });
    const invitationCodeResult = await InviteMutations.createAppInvitation(
      {},
      { input: { notes: 'test', expiresAt: ZonedDateTime.now().plusHours(1) } },
      { user: { id: '00000000-0000-0000-0000-000000000000' } }
    );
    const invitation = await invitationCodeResult.invitation;
    const { code: invitationCode } = invitation;

    const res = await userClient.mutate({
      mutation: gql`
        mutation create($input: CreateUserInput) {
          createUser(input: $input) {
            user {
              id
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

    const dbMemberships = await Membership.all({
      userId: id,
    });

    expect(dbMemberships).toHaveLength(2);
    expect(dbMemberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ communityId: GLOBAL_COMMUNITY_ID }),
        expect.objectContaining({ communityId: privateCommunityId }),
      ])
    );
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

    // NOTE: Upgrading sharp made the images stop working on Andy's mac, this fixes it. It shouldn't have to.
    expect(
      [MACOS_PHOTO, LINUX_PHOTO].map(preview => ({
        preview,
        __typename: 'Photo',
      }))
    ).toContainEqual(pick(returnedPhoto, ['preview', '__typename']));

    const dbUser = await User.byId(id);
    expect([MACOS_PHOTO, LINUX_PHOTO]).toContain(dbUser.photoPreview);
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

  it('updates properly', async () => {
    const updateUser = gql`
      mutation updateCurrentUser($input: UpdateCurrentUserInput) {
        updateCurrentUser(input: $input) {
          user {
            id
          }
        }
      }
    `;

    await client.mutate({
      mutation: updateUser,
      variables: {
        input: { firstName: 'aaaaaaaa', preferences: { a: false, b: true } },
      },
    });
    expect(await User.byId(user.id)).toMatchObject({
      firstName: 'aaaaaaaa',
      preferences: { a: false, b: true },
    });

    await client.mutate({
      mutation: updateUser,
      variables: {
        input: { preferences: { b: false, c: true } },
      },
    });
    expect(await User.byId(user.id)).toMatchObject({
      preferences: { a: false, b: false, c: true },
    });
  });
});

describe('allUsers', () => {
  const allUsersQuery = gql`
    query allUsers($prefix: String) {
      allUsers(prefix: $prefix) {
        count
        edges {
          node {
            id
            firstName
            lastName
          }
        }
      }
    }
  `;

  it('blocks non-admins', () => {
    setAdmin(false);
    return expect(
      client.query({
        query: allUsersQuery,
      })
    ).rejects.toMatchSnapshot();
  });

  it('returns all users', async () => {
    setAdmin(true);
    const { data } = await client.query({ query: allUsersQuery });
    expect(data.allUsers.count).toEqual(2);
  });

  it('returns one user given a prefix', async () => {
    setAdmin(true);
    const { data } = await client.query({
      query: allUsersQuery,
      variables: { prefix: user.firstName.substring(0, 2).toUpperCase() },
    });
    expect(data.allUsers.count).toEqual(1);
    expect(data.allUsers.edges[0].node.firstName).toEqual(user.firstName);
  });
});
