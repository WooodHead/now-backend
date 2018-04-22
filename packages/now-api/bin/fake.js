#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
const vorpal = require('vorpal')();
const { ApolloClient } = require('apollo-client');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');
const gql = require('graphql-tag');
const fetch = require('node-fetch');
const { LocalDate, DateTimeParseException } = require('js-joda');
const faker = require('faker');
const { range, shuffle } = require('lodash');
const randomEmoji = require('random-emoji');
const { venues } = require('../src/venues');

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({ uri: 'http://localhost:3000/graphql', fetch }),
});

const { chalk } = vorpal;

const parseDate = (name, args) => {
  const value = args[name];
  if (value) {
    try {
      return LocalDate.parse(value);
    } catch (e) {
      if (e instanceof DateTimeParseException) {
        vorpal.log(
          chalk.red(
            `Error parsing ${name}: ${value} use the format 'YYYY-MM-DD'`
          )
        );
      } else {
        vorpal.log(chalk.red(`Unknown error ${e}`));
      }
    }
  }
  return undefined;
};

const buildRange = (start, end) => {
  const dateRange = [];
  let nextDate = start;

  do {
    dateRange.push(nextDate);
    nextDate = nextDate.plusDays(1);
  } while (nextDate.compareTo(end) <= 0);

  return dateRange;
};
const generateEvent = (venue, id, activityDate) => {
  const input = {
    activityId: id,
    time: faker.date
      .between(
        activityDate.atStartOfDay(),
        activityDate.atTime4(23, 59, 59, 999)
      )
      .toISOString(),
    limit: faker.random.number({ max: 20, min: 5 }),
    location: {
      foursquareVenueId: venue.id,
      lat: venue.lat,
      lng: venue.lng,
      address: venue.address,
      name: venue.name,
      crossStreet: venue.crossStreet,
      city: venue.city,
      state: venue.state,
      postalCode: venue.postalCode,
      country: venue.country,
      neighborhood: venue.crossStreet,
      isFuzzed: false,
    },
  };
  vorpal.log(`Generating event for ${id} as ${JSON.stringify(input)}`);
  return client
    .mutate({
      mutation: gql`
        mutation createEvent($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
              time
              limit
              location {
                name
              }
            }
          }
        }
      `,
      variables: {
        input,
      },
    })
    .then(({ data: { createEvent: { event } } }) => {
      vorpal.log(event);
    })
    .catch(e => {
      vorpal.log(JSON.stringify(e));
    });
};
const generateActivity = (date, count) =>
  client
    .mutate({
      mutation: gql`
        mutation createActivity($input: CreateActivityInput!) {
          createActivity(input: $input) {
            activity {
              id
              title
              emoji
              description
            }
          }
        }
      `,
      variables: {
        input: {
          title: `${faker.hacker.ingverb()} for ${faker.hacker.noun()}`,
          activityDate: date,
          emoji: randomEmoji.random({ count: 1 })[0].character,
          description: faker.hacker.phrase(),
        },
      },
    })
    .then(({ data: { createActivity: { activity: { id } } } }) => {
      const shuffledVenues = shuffle(venues);
      return Promise.all(
        range(count).map(i => generateEvent(shuffledVenues[i], id, date))
      );
    })
    .catch(e => {
      vorpal.log(JSON.stringify(e));
    });

vorpal
  .command('activity <start-date> [end-date]')
  .option('-e', 'Number of events')
  .action(args => {
    vorpal.log(args);
    const startDate = parseDate('start-date', args);
    let endDate = parseDate('end-date', args);
    const eventCount = args.options.e || 1;

    if (!startDate) {
      vorpal.log(chalk.red('Valid startDate required - terminating'));
      return Promise.resolve();
    }

    if (!endDate) {
      endDate = startDate;
    }

    if (startDate.compareTo(endDate) > 0) {
      vorpal.log(chalk.red('startDate must be before endDate - terminating'));
      return Promise.resolve();
    }
    const dateRange = buildRange(startDate, endDate);

    vorpal.log(
      `Generating ${dateRange.length} activities with ${eventCount} events`
    );

    return Promise.all(dateRange.map(d => generateActivity(d, eventCount)));
  });

vorpal.delimiter('fake$').show();
