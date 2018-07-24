import { parseInputGeometry } from '../resolvers/Location';

describe('parseInputGeometry', () => {
  it('rejects invalid inputs', () => {
    expect(() =>
      parseInputGeometry({ lat: 45 })
    ).toThrowErrorMatchingSnapshot();
    expect(() =>
      parseInputGeometry({ lat: 100, lng: 45 })
    ).toThrowErrorMatchingSnapshot();
    expect(() =>
      parseInputGeometry({ lat: 45, lng: 20, geojson: {} })
    ).toThrowErrorMatchingSnapshot();
    expect(() =>
      parseInputGeometry({
        geojson: {
          type: 'LineString',
          coordinates: [[-170, 10], [170, 11]],
        },
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('parses lat/lng', () => {
    expect(
      parseInputGeometry({ lng: -73.9961013793945, lat: 40.7256011962891 })
    ).toMatchSnapshot();
  });

  it('parses geojson', () => {
    expect(
      parseInputGeometry({
        geojson: {
          type: 'Point',
          coordinates: [-73.9961013793945, 40.7256011962891],
        },
      })
    ).toMatchSnapshot();
  });

  it('handles empty input when told to', () => {
    expect(() => parseInputGeometry({})).toThrowErrorMatchingSnapshot();
    expect(parseInputGeometry({}, false)).toBeUndefined();
  });
});
