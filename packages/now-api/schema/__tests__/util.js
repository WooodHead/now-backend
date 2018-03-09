import { paginatify } from '../util';
import { mockPromise } from '../../db/mock';

const mockDynamoRsvp1 = {
  id: '1',
  userId: '1',
  action: 'add',
  eventId: '3',
  createdAt: '2018-02-26T19:44:34.778Z',
  updatedAt: '2018-02-27T19:44:34.778Z',
};
const mockDynamoRsvp2 = {
  id: '2',
  userId: '2',
  action: 'add',
  eventId: '3',
  createdAt: '2018-02-26T18:44:34.778Z',
  updatedAt: '2018-02-26T18:44:34.778Z',
};
const mockDynamoRsvp3 = {
  id: '3',
  userId: '3',
  action: 'add',
  eventId: '3',
  createdAt: '2018-02-26T18:41:34.778Z',
  updatedAt: '2018-02-26T18:41:34.778Z',
};
const mockDynamoSettings = {
  expr: 'eventId = :eventId',
  exprValues: { ':eventId': '3' },
  tableName: 'now_rsvps',
  cursorId: 'updatedAt',
};

jest.mock('../../db', () => ({
  get: () => mockPromise({ id: 1 }),
  query: () => mockPromise([mockDynamoRsvp1, mockDynamoRsvp2, mockDynamoRsvp3]),
}));

describe('paginatify basics', () => {
  it('returns 3 objects when no arguments are set', async () => {
    const data = await paginatify(mockDynamoSettings, {
      first: undefined,
      last: undefined,
      after: undefined,
      before: undefined,
    });
    expect(data.edges.length).toEqual(3);
  });
  it('Is encoding cursor correctly', async () => {
    const data = await paginatify(mockDynamoSettings, {
      first: undefined,
      last: undefined,
      after: undefined,
      before: undefined,
    });
    expect(Buffer.from(data.edges[0].cursor, 'base64').toString()).toEqual(
      mockDynamoRsvp1.updatedAt
    );
  });
});

describe('paginatify paging', () => {
  it('returns first two objects', async () => {
    const data = await paginatify(mockDynamoSettings, {
      first: 2,
      last: undefined,
      after: undefined,
      before: undefined,
    });
    expect(data.edges.length).toEqual(2);
    expect(data.edges[1].node.id).toEqual(mockDynamoRsvp2.id);
  });
  it('returns last two objects', async () => {
    const data = await paginatify(mockDynamoSettings, {
      first: undefined,
      last: 2,
      after: undefined,
      before: undefined,
    });
    expect(data.edges.length).toEqual(2);
    expect(data.edges[0].node.id).toEqual(mockDynamoRsvp2.id);
  });
  it('returns everything when last > total', async () => {
    const data = await paginatify(mockDynamoSettings, {
      first: undefined,
      last: 6,
      after: undefined,
      before: undefined,
    });
    expect(data.edges.length).toEqual(3);
  });
});
