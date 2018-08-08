import { schema } from '../../db/mock';

describe('typeDefs.graphql', () => {
  it('validates', () => {
    expect(schema).toBeDefined();
  });
});
