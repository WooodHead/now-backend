import { Kind, GraphQLScalarType } from 'graphql';
import { LocalDate } from 'js-joda';
import { computeAge } from '../util';

const MIN_USER_AGE = 18;

const toLocalDate = str => {
  const localDate = LocalDate.parse(str);
  if (computeAge(localDate) < MIN_USER_AGE) {
    throw new Error(
      `You must be at least ${MIN_USER_AGE} years old to use Meetup Now.`
    );
  }
  return localDate;
};

export default new GraphQLScalarType({
  name: 'Birthdate',
  description: 'The date of birth of a person, serialized as YYYY-MM-DD.',
  serialize: date => date.toString(),
  parseValue: toLocalDate,
  parseLiteral: ast => {
    if (ast.kind === Kind.STRING) {
      return toLocalDate(ast.value);
    }
    throw new Error('Birthdate must be a String.');
  },
});
