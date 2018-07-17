import { Location } from '../../../db/repos';
import { sqlPaginatify } from '../../util';
import { syncWeworkMarket, weworkMarkets } from './wework';

// Queries
const allLocations = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Location.all({}), input);

const manyLocations = (root, { ids }, { loaders }) =>
  loaders.locations.loadMany(ids);

const locationQuery = (root, { id }, { loaders }) => loaders.locations.load(id);

export const queries = {
  location: locationQuery,
  allLocations,
  manyLocations,
  weworkMarkets,
};

export const mutations = { syncWeworkMarket };

const lng = ({ location }) => location.x;
const lat = ({ location }) => location.y;
const geojson = ({ location }) => location.toGeoJSON();

export const resolvers = { lng, lat, geojson };
