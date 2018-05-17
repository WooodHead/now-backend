import sql from '../../db/sql';
import { SQL_TABLES } from '../../db/constants';
import { getTokensForEvent } from '../tokens';
import factory from '../../db/factory';

const users = factory.buildList('user', 3);
users[0].preferences = { receiveAlerts: false };
const eventId = 'fa8a48e0-1043-11e8-b919-8f03cfc03e44';
const mockRsvp1 = factory.build('rsvp', { eventId }, { user: users[0] });
const mockRsvp2 = factory.build('rsvp', { eventId }, { user: users[1] });

const device1a = factory.build('device', {}, { user: users[0] });
const device1b = factory.build('device', {}, { user: users[0] });

const device2a = factory.build('device', {}, { user: users[1] });
const device2b = factory.build('device', {}, { user: users[1] });

const device3a = factory.build('device', {}, { user: users[2] });

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.USERS).truncate(),
    sql(SQL_TABLES.RSVPS).truncate(),
    sql(SQL_TABLES.DEVICES).truncate(),
  ]);

beforeAll(() =>
  truncateTables().then(() =>
    Promise.all([
      sql(SQL_TABLES.USERS).insert(users),
      sql(SQL_TABLES.RSVPS).insert([mockRsvp1, mockRsvp2]),
      sql(SQL_TABLES.DEVICES).insert([
        device1a,
        device1b,
        device2a,
        device2b,
        device3a,
      ]),
    ])
  )
);
afterAll(() => truncateTables());

describe('getTokensForEvent', () => {
  it('returns tokens for event', async () => {
    const tokens = await getTokensForEvent(
      'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
      ''
    );

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
    const tokens = await getTokensForEvent(
      'fa8a48e0-1043-11e8-b919-8f03cfc03e44',
      'receiveAlerts'
    );
    expect(tokens).toHaveLength(2);
    expect(tokens).toEqual(
      expect.arrayContaining([device2a.token, device2b.token])
    );
  });
});
