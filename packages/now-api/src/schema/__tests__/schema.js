import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from '../typeDefs.graphql';

describe('typeDefs.graphql', () => {
  it('validates', () => {
    const schema = makeExecutableSchema({
      typeDefs,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
    });
    expect(schema).toBeDefined();
  });
});
