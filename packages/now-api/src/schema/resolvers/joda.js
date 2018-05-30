// @flow
import { GraphQLScalarType, Kind } from 'graphql';
import type { GraphQLScalarTypeConfig } from 'graphql';
import * as joda from 'js-joda';

type JodaType<T> = {
  parse: string => T,
};

const jodaToGraphql = <T>(name: string, jodaType: JodaType<T>) => {
  const parse = (value: string): T => {
    try {
      return jodaType.parse(value);
    } catch (e) {
      throw new TypeError(
        `${name} can not represent an invalid string ${value}`
      );
    }
  };

  const config: GraphQLScalarTypeConfig<T, string> = {
    name,
    serialize: (value): string => {
      if (value instanceof jodaType) {
        return value.toString();
      }
      if (typeof value === 'string') {
        try {
          jodaType.parse(value); // will throw if it's invalid
        } catch (e) {
          throw new TypeError(
            `${name} can not represent an invalid string ${value}`
          );
        }
        return value;
      }
      throw new TypeError(
        `${name} can not represent invalid type ${JSON.stringify(value)}`
      );
    },
    parseValue: (value): T => {
      if (typeof value === 'string') {
        return parse(value);
      }
      throw new TypeError(
        `${name} can not represent non-string type ${JSON.stringify(value)}`
      );
    },
    parseLiteral: (ast): T => {
      if (ast.kind !== Kind.STRING) {
        throw new TypeError(
          `${name} can not represent non-string type ${String(
            ast.value != null ? ast.value : null
          )}`
        );
      }
      return parse(ast.value);
    },
  };

  return new GraphQLScalarType(config);
};

export const LocalDate = jodaToGraphql('LocalDate', joda.LocalDate);
export const LocalDateTime = jodaToGraphql('LocalDateTime', joda.LocalDateTime);
export const LocalTime = jodaToGraphql('LocalTime', joda.LocalTime);
export const ZonedDateTime = jodaToGraphql('ZonedDateTime', joda.ZonedDateTime);
