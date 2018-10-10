import sql, { makepoint } from '../sql';

beforeAll(() =>
  sql.schema.createTable('geotest', t => {
    t.increments();
    t.specificType('location', 'geography(point)');
    t.string('name');
  }));

afterAll(() => sql.schema.dropTable('geotest'));

describe('geo types', () => {
  it('can be written and read', async () => {
    await sql('geotest').insert([
      {
        location: makepoint(0, 0),
        name: 'null island',
      },
      {
        location: makepoint(-73.9954, 40.7259),
        name: 'meetup hq',
      },
    ]);

    const results = (await sql('geotest')).map(r => ({
      ...r,
      location: r.location.toGeoJSON(),
    }));
    expect(results).toHaveLength(2);
    expect(results).toContainEqual({
      location: { type: 'Point', coordinates: [0, 0] },
      name: 'null island',
      id: expect.any(Number),
    });
    expect(results).toContainEqual({
      location: { type: 'Point', coordinates: [-73.9954, 40.7259] },
      name: 'meetup hq',
      id: expect.any(Number),
    });
  });
});
