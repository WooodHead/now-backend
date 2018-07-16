import gql from 'graphql-tag';

import { SQL_TABLES } from '../db/constants';
import factory from '../db/factory';
import { client } from '../db/mock';
import sql from '../db/sql';

const truncateTables = () =>
  Promise.all([sql(SQL_TABLES.LOCATIONS).truncate()]);

const locations = factory.buildList('location', 3);

beforeAll(() =>
  truncateTables().then(() => sql(SQL_TABLES.LOCATIONS).insert(locations)));
afterAll(() => truncateTables());

describe('location', () => {
  it('resolves geometry', () =>
    Promise.all(
      locations.map(async ({ id }) => {
        const {
          data: { location },
        } = await client.query({
          query: gql`
            query location($id: ID!) {
              location(id: $id) {
                id
                name
                lat
                lng
                geojson
              }
            }
          `,
          variables: { id },
        });
        expect(location.id).toEqual(id);
        expect(location.lat).toBeNumeric();
        expect(location.lng).toBeNumeric();
        expect(location.geojson).toMatchObject({
          type: 'Point',
          coordinates: [location.lng, location.lat],
        });
      })
    ));
});
