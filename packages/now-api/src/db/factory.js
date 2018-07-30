/* eslint-disable import/no-extraneous-dependencies  */
import { Factory } from 'rosie';
import uuid from 'uuid/v4';
import { address, name, date, internet, random, lorem, hacker } from 'faker';
import randomEmoji from 'random-emoji';
import { LocalDate, ZoneId, LocalDateTime } from 'js-joda';
import {
  EVENT_INVITE_TYPE,
  APP_INVITE_TYPE,
} from '../schema/resolvers/Invitation';

const md5 = () =>
  random
    .hexaDecimal(32)
    .toLowerCase()
    .substring(2);

Factory.define('user')
  .attr('id', uuid)
  .attr('auth0Id', () => random.alphaNumeric(24))
  .attr('email', internet.email)
  .attr('firstName', name.firstName)
  .attr('lastName', name.lastName)
  .attr('bio', lorem.paragraph)
  .attr('location', () => `${address.city()}, ${address.stateAbbr()}`)
  .attr('preferences', {})
  .attr('birthday', () =>
    LocalDate.now()
      .minusYears(20)
      .toString()
  )
  .attr('photoId', md5)
  .attr(
    'photoPreview',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAmRJREFUWAntmN1Kw0AQhU/8Fwv1F0FEKCgV9UbvvKkPIFJ8AB/C1/BZfAdF9EpBFEUEBQUp0l6opRVEi/Y4LIlx006aWHuRgTHpZHbmy9lssuh81g0dbF0dzPaNlgBGnaFEwUTBqAqY8e/vwM4OUCiYiO7Ytmfw+Bi4vRXXoUlW2wD396VhqRQGD2gL4N0dcH/fwYBGPSIWiwKq/atSsFbTlvudV60CJyduPOwU97hD7WcfH8D2NpBOA0tLwOIikM0CfX32fH/06AjgCjb29ga8vEg9E2t0bArYU8/gfod3vrcnztjcnMASeGoquMXBwe9rrMUb1lhTQBYZGwMeH91yVPXqSnx3FxgZEVgqPD8PDA5K7uWl3Jg7Us4IODvrj9p/twToL/X0BBweind3A5mMgJ6e+jPld5iFogIcH7c3skW5oG5uxG3XGQuzUFSrOAxgEJQ3Hjsgn8E4LcwU/4uCr68A348aUwHGrSDBtCqqAFMpYGBAc7/6HO1zqAJk27hVjB0waCVPTAC5HDA6qlePmdopVr0HWTBIwa0t+TYz5+EBODsTN9srxm2mVVANaFNwYcGFI8T0tPj6OvD8LKDn58D19c8NA3P/HNBxgM1NtrLb8DCwtibOHQy/y1T34gKoVIByWaB7e+3jTVStoH+KV1aAmRlTpvGxvx9gPp07I34KqWAzOFZVA3qnuKu+9vP5xlBBV6k8t2p0jalfM3wPDg1JydVVYHJSUz56jhqQragip2VjI3pjbQX1FLMgd8/Ly7JB1TaImuck/8CMKGGoZzBir5aGJ4AtyeYZlCjoEaOl0y+Le57bWRVobwAAAABJRU5ErkJggg=='
  );

Factory.define('device')
  .option('user', () => ({ id: uuid() }))
  .attr('token', uuid)
  .attr('type', () => random.arrayElement(['ios', 'android']))
  .attr('model', random.randomWord)
  .attr('userId', ['user'], ({ id }) => id);

Factory.define('rsvp')
  .option('user', () => ({ id: uuid() }))
  .option('event', () => ({ id: uuid() }))
  .attr('id', uuid)
  .attr('action', 'add')
  .attr('userId', ['user'], ({ id }) => id)
  .attr('eventId', ['event'], ({ id }) => id);

Factory.define('appInvite')
  .option('inviter', () => ({ id: uuid() }))
  .attr('id', uuid)
  .attr('type', APP_INVITE_TYPE)
  .attr('code', () => String(random.number({ max: 999999, min: 100000 })))
  .attr('expiresAt', () =>
    LocalDateTime.now()
      .plusDays(1)
      .toString()
  )
  .attr('inviterId', ['inviter'], ({ id }) => id);

Factory.define('eventInvite')
  .option('inviter', () => ({ id: uuid() }))
  .option('event', () => ({ id: uuid() }))
  .attr('id', uuid)
  .attr('type', EVENT_INVITE_TYPE)
  .attr('code', () => String(random.number({ max: 999999, min: 100000 })))
  .attr('expiresAt', () =>
    LocalDateTime.now()
      .plusDays(1)
      .toString()
  )
  .attr('inviterId', ['inviter'], ({ id }) => id)
  .attr('eventId', ['event'], ({ id }) => id);

Factory.define('activity')
  .attr('id', uuid)
  .attr('activityDate', () =>
    date
      .soon(1)
      .toISOString()
      .substring(0, 10)
  )
  .attr('title', () => `${hacker.ingverb()} for ${hacker.noun()}`)
  .attr('emoji', () => randomEmoji.random({ count: 1 })[0].character)
  .attr('description', hacker.phrase);

Factory.define('todayActivity')
  .extend('activity')
  .attr('activityDate', () => new Date().toISOString().substring(0, 10));

Factory.define('event')
  .option('activity', () => ({
    id: uuid(),
    activityDate: date
      .soon(1)
      .toISOString()
      .substring(0, 10),
  }))
  .option('location', () => ({ id: uuid() }))
  .attr('id', uuid)
  .attr('activityId', ['activity'], ({ id }) => id)
  .attr('locationId', ['location'], ({ id }) => id)
  .attr('limit', () => random.number({ max: 20, min: 5 }))
  .attr('time', ['activity'], ({ activityDate: activityDateString }) => {
    const activityDate = LocalDate.parse(activityDateString);
    return date
      .between(
        activityDate.atStartOfDay(),
        activityDate.atTime4(23, 59, 59, 999)
      )
      .toISOString();
  })
  .attr('timezone', () => random.arrayElement(ZoneId.getAvailableZoneIds()));

Factory.define('location')
  .attr('id', uuid)
  .attr('name', hacker.ingverb)
  .attr('address', address.streetAddress)
  .attr('city', address.city)
  .attr('state', address.stateAbbr)
  .attr('postalCode', address.zipCode)
  .attr('country', address.countryCode)
  .attr('neighborhood', hacker.noun)
  .attr('foursquareVenueId', md5)
  .attr(
    'location',
    () => `SRID=4326;POINT(${address.longitude()} ${address.latitude()})`
  );

Factory.define('message')
  .option('event', () => ({ id: uuid() }))
  .attr('id', uuid)
  .attr('ts', () => date.recent(1).getTime())
  .attr('text', hacker.phrase)
  .attr('eventId', ['event'], ({ id }) => id)
  .attr('userId', ['user'], ({ id }) => id);

export default Factory;
