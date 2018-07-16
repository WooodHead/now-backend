/* eslint-disable import/prefer-default-export */
import { types } from 'pg';
import {
  DateTimeFormatter,
  DateTimeFormatterBuilder,
  IsoChronology,
  LocalDate,
  LocalDateTime,
  ResolverStyle,
  ZonedDateTime,
} from 'js-joda';
import { Geometry } from 'wkx';

const DATE_OID = 1082;
const TIMESTAMP_OID = 1114;
const TIMESTAMPTZ_OID = 1184;

const parse = (type, formatter = undefined) => str =>
  str === null ? null : type.parse(str, formatter);

// see https://github.com/js-joda/js-joda/blob/master/src/format/DateTimeFormatter.js
// but postgres is weird and doesn't quite conform to the standard
const timestampFormatter = new DateTimeFormatterBuilder()
  .parseCaseInsensitive()
  .append(DateTimeFormatter.ISO_LOCAL_DATE)
  .appendLiteral(' ')
  .append(DateTimeFormatter.ISO_LOCAL_TIME)
  .toFormatter(ResolverStyle.STRICT)
  .withChronology(IsoChronology.INSTANCE);

const timestamptzFormatter = new DateTimeFormatterBuilder()
  .parseCaseInsensitive()
  .append(timestampFormatter)
  .appendOffset('+HH:mm', 'Z')
  .toFormatter(ResolverStyle.STRICT)
  .withChronology(IsoChronology.INSTANCE);

const parseWkb = wkb => Geometry.parse(Buffer.from(wkb, 'hex'));

export const setPgTypes = sql => {
  types.setTypeParser(DATE_OID, parse(LocalDate));
  types.setTypeParser(TIMESTAMP_OID, parse(LocalDateTime, timestampFormatter));
  types.setTypeParser(
    TIMESTAMPTZ_OID,
    parse(ZonedDateTime, timestamptzFormatter)
  );

  sql
    .select('oid', 'typname')
    .from('pg_type')
    .whereIn('typname', ['geometry', 'geography'])
    .then(t => {
      t.forEach(({ oid }) => types.setTypeParser(oid, parseWkb));
    });
};
