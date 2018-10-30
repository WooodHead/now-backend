import uuid from 'uuid/v4';
import { Geometry, Point } from 'wkx';

import { now, prefixSearch } from '../../../db/sql';
import { Location } from '../../../db/repos';
import { sqlPaginatify } from '../../util';
import { syncWeworkMarket, weworkMarkets } from './wework';

// Queries
const allLocations = (root, { input, orderBy = 'id', prefix }) => {
  const args = prefix ? prefixSearch('name', prefix, true) : [];
  return sqlPaginatify(orderBy, Location.all(...args), input);
};

const manyLocations = (root, { ids }, { loaders }) =>
  loaders.locations.loadMany(ids);

const locationQuery = (root, { id }, { loaders }) => loaders.locations.load(id);

export const queries = {
  location: locationQuery,
  allLocations,
  manyLocations,
  weworkMarkets,
};

// visible for testing
export const parseInputGeometry = ({ lat, lng, geojson }, required = true) => {
  if (lat !== undefined || lng !== undefined) {
    if (geojson !== undefined) {
      throw new Error('Either lat/lng or geojson is required, but not both.');
    }
    if (typeof lat !== 'number' || Math.abs(lat) > 90) {
      throw new Error('Invalid latitude.');
    }
    if (typeof lng !== 'number' || Math.abs(lng) > 180) {
      throw new Error('Invalid longitude.');
    }

    return new Point(lng, lat).toWkt();
  }

  if (typeof geojson !== 'object') {
    if (typeof geojson === 'undefined' && !required) {
      return undefined;
    }
    throw new Error('Either lat/lng or geojson is required.');
  }

  let geom;
  try {
    geom = Geometry.parseGeoJSON(geojson);
  } catch (e) {
    throw new Error('Invalid GeoJSON');
  }
  if (!(geom instanceof Point)) {
    throw new Error('Only Point geometries are accepted.');
  }
  return geom.toWkt();
};

const createLocation = (root, { input }, { loaders }) => {
  const {
    foursquareVenueId,
    address,
    name,
    crossStreet,
    city,
    state,
    postalCode,
    country,
    neighborhood,
  } = input;

  const id = uuid();
  const location = parseInputGeometry(input);

  return Location.insert({
    id,
    foursquareVenueId: foursquareVenueId || null, // coerce empty string to null
    location,
    address,
    name,
    crossStreet,
    city,
    state,
    postalCode,
    country: country || 'United States',
    neighborhood,
    createdAt: now(),
    updatedAt: now(),
  }).then(() => ({ location: loaders.locations.load(id) }));
};

const updateLocation = (root, { input }, { loaders }) => {
  const {
    id,
    foursquareVenueId,
    address,
    name,
    crossStreet,
    city,
    state,
    postalCode,
    country,
    neighborhood,
  } = input;

  const location = parseInputGeometry(input, false);

  loaders.locations.clear(id);

  return Location.update({
    id,
    foursquareVenueId: foursquareVenueId || null, // coerce empty string to null
    location,
    address,
    name,
    crossStreet,
    city,
    state,
    postalCode,
    country: country || 'United States',
    neighborhood,
    updatedAt: now(),
  }).then(() => ({ location: loaders.locations.load(id) }));
};

export const mutations = { createLocation, updateLocation, syncWeworkMarket };

const lng = ({ location }) => location.x;
const lat = ({ location }) => location.y;
const geojson = ({ location }) => location.toGeoJSON();

export const resolvers = { lng, lat, geojson };
