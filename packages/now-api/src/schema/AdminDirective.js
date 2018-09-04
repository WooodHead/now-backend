// @flow
import { GraphQLError, defaultFieldResolver } from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';
import type { GraphQLField, GraphQLFieldResolver } from 'graphql';

type Context = {
  scopes: Array<string>,
};

export const isAdmin = (context: { scopes: Array<string> }) =>
  context.scopes.includes('admin');

class AdminDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<*, *>) {
    const { resolve = defaultFieldResolver } = field;
    // eslint-disable-next-line no-param-reassign
    field.resolve = this.wrap(resolve);
  }

  wrap = <TSource>(
    baseResolver: GraphQLFieldResolver<TSource, Context>
  ): GraphQLFieldResolver<TSource, Context> => (root, args, context, info) => {
    if (!isAdmin(context)) {
      throw new GraphQLError('You must be an admin.');
    }
    return baseResolver(root, args, context, info);
  };
}

export default AdminDirective;
