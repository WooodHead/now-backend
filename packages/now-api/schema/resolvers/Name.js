import { Kind, GraphQLScalarType } from 'graphql';
import { identity } from '../util';

// name must include at least one digit or letter
// we're using some ES2018 regex features (via babel), which eslint doesn't
// fully support yet, so we have to disable a spurious error:
// eslint-disable-next-line no-useless-escape
const NAME_MATCHER = /[\p{Letter}\p{Decimal_Number}]/u;

const parseName = str => {
  if (NAME_MATCHER.test(str)) {
    return str;
  }
  throw new Error('Name can not be empty.');
};

export default new GraphQLScalarType({
  name: 'Name',
  description:
    "A component of a person's name, consisting of at least one Unicode letter or digit.",
  serialize: identity,
  parseValue: parseName,
  parseLiteral: ast => {
    if (ast.kind === Kind.STRING) {
      return parseName(ast.value);
    }
    throw new Error('Name must be a String.');
  },
});
