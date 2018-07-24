import rp from 'request-promise-native';
import uuid from 'uuid/v4';
import sql, { makepoint } from '../../../db/sql';

const GEOGROUPINGS_ENDPOINT =
  'https://api-proxy.wework.com/locations/api/v1/geogroupings';
const BUILDINGS_ENDPOINT =
  'https://api-proxy.wework.com/locations/api/v2/buildings';

const geogroupings = () =>
  rp({
    uri: GEOGROUPINGS_ENDPOINT,
    json: true,
  });

export const weworkMarkets = (root, { type = 'Marketgeo' }) =>
  geogroupings().then(result =>
    result.geogroupings
      .filter(grouping => grouping.type === type)
      .map(grouping => grouping.slug)
  );

export const syncWeworkMarket = (root, { market }, { loaders }) => {
  if (!market) {
    throw new Error('market is required');
  }

  return geogroupings()
    .then(result => {
      const grouping = result.geogroupings.find(g => g.slug === market);
      if (!grouping) throw new Error('invalid market');
      return result.buildings
        .filter(building => grouping.buildings.includes(building.id))
        .map(building => building.slug);
    })
    .then(slugs =>
      Promise.all(
        slugs.map(slug =>
          rp({
            uri: `${BUILDINGS_ENDPOINT}/${slug}`,
            json: true,
          }).then(response => response.building)
        )
      )
    )
    .then(buildings =>
      sql.transaction(trx =>
        Promise.all(
          buildings.map(async building => {
            const data = {
              address: [building.line1, building.line2]
                .filter(line => line.length > 0)
                .join(', '),
              city: building.city,
              country: 'United States', // FIXME: wework API for this is wacky, stop hardcoding when we expand internationally
              state: building.state,
              postalCode: building.zip,
              location: makepoint(
                Number(building.longitude),
                Number(building.latitude)
              ),
              name: `WeWork ${building.name}`,
              updatedAt: trx.raw('now()'),
              weworkId: building.id,
            };
            const oldRow = await trx('locations')
              .where({ weworkId: building.id })
              .forUpdate()
              .first();
            if (oldRow) {
              const oldId = oldRow.id;
              await trx('locations')
                .where({ id: oldId })
                .update(data);
              return oldId;
            }
            const newId = uuid();
            await trx('locations').insert({
              id: newId,
              createdAt: trx.raw('now()'),
              ...data,
            });
            return newId;
          })
        )
      )
    )
    .then(ids => ids.map(id => loaders.locations.load(id)));
};
