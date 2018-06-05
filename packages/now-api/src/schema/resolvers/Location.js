import { Location } from '../../db/repos';
import { sqlPaginatify } from '../util';
// Queries
const allLocations = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Location.all({}), input);

const manyLocations = (root, { ids }, { loaders }) =>
  loaders.locations.loadMany(ids);

const locationQuery = (root, { id }, { loaders }) => loaders.locations.load(id);

export const queries = { location: locationQuery, allLocations, manyLocations };

export const mutations = {};

export const resolvers = {};
