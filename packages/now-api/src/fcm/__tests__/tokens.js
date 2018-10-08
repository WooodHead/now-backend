import uuid from 'uuid/v4';

import sql from '../../db/sql';
import { SQL_TABLES, GLOBAL_COMMUNITY_ID } from '../../db/constants';
import { getTokensForEvent, getTokensForRsvp } from '../tokens';
import factory from '../../db/factory';

const users = factory.buildList('user', 4);
users[0].preferences = { receiveAlerts: false };
const event = factory.build('event', { communityId: GLOBAL_COMMUNITY_ID });
const eventId = event.id;
const mockRsvp1 = factory.build('rsvp', { eventId }, { user: users[0] });
const mockRsvp2 = factory.build('rsvp', { eventId }, { user: users[1] });
const mockRsvp3 = factory.build(
  'rsvp',
  { eventId, action: 'remove' },
  { user: users[2] }
);
const memberships = users.map(({ id }) => ({
  id: uuid(),
  userId: id,
  communityId: GLOBAL_COMMUNITY_ID,
}));

const device1a = factory.build('device', {}, { user: users[0] });
const device1b = factory.build('device', {}, { user: users[0] });

const device2a = factory.build('device', {}, { user: users[1] });
const device2b = factory.build('device', {}, { user: users[1] });

const device3a = factory.build('device', {}, { user: users[2] });

const device4a = factory.build('device', {}, { user: users[3] });

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.USERS).truncate(),
    sql(SQL_TABLES.EVENTS).truncate(),
    sql(SQL_TABLES.RSVPS).truncate(),
    sql(SQL_TABLES.DEVICES).truncate(),
    sql(SQL_TABLES.MEMBERSHIPS).truncate(),
  ]);

beforeAll(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.USERS).insert(users),
      sql(SQL_TABLES.EVENTS).insert(event),
      sql(SQL_TABLES.MEMBERSHIPS).insert(memberships),
      sql(SQL_TABLES.RSVPS).insert([mockRsvp1, mockRsvp2, mockRsvp3]),
      sql(SQL_TABLES.DEVICES).insert([
        device1a,
        device1b,
        device2a,
        device2b,
        device3a,
        device4a,
      ]),
    ])
  ));
afterAll(() => truncateTables());

describe('getTokensForEvent', () => {
  it('returns tokens for event', async () => {
    const tokens = await getTokensForEvent(event.id, '');

    expect(tokens).toHaveLength(4);
    expect(tokens).toEqual(
      expect.arrayContaining([
        device1a.token,
        device1b.token,
        device2a.token,
        device2b.token,
      ])
    );
  });
  it('ignores tokens if pref set', async () => {
    const tokens = await getTokensForEvent(event.id, 'receiveAlerts');
    expect(tokens).toHaveLength(2);
    expect(tokens).toEqual(
      expect.arrayContaining([device2a.token, device2b.token])
    );
  });
});

describe('getTokensForRsvp', () => {
  it('returns tokens for rsvp', async () => {
    const tokens = await getTokensForRsvp(mockRsvp2.id, '');

    expect(tokens).toHaveLength(2);
    expect(tokens).toEqual(
      expect.arrayContaining([device2a.token, device2b.token])
    );
  });
  it('ignores tokens if pref set', async () => {
    const tokens = await getTokensForEvent(mockRsvp1.id, 'receiveAlerts');
    expect(tokens).toHaveLength(0);
  });
});
