/* eslint-disable */
import { uniqBy, omit } from 'lodash';
import uuid from 'uuid/v4';

import sql from '../db/sql';
import { scan } from '../db';
import { SQL_TABLES } from '../db/constants';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const filterBadUuid = id => UUID_REGEX.test(id);
const filterBadUuidField = field => obj => filterBadUuid(obj[field]);

const DYNAMO_TABLES = {
  USER: 'now_user',
  DEVICE: 'now_device',
  ACTIVITY: 'now_template',
  EVENT: 'now_event',
  RSVP: 'now_rsvp',
  MESSAGE: 'now_messages',
};

const locations = {};

const migrateUsers = () =>
  scan(DYNAMO_TABLES.USER)
    .then(users => {
      console.log('user count', users.length);
      users.filter(filterBadUuidField('id')).forEach(async user => {
        try {
          await sql
            .insert({
              id: user.id,
              auth0Id: user.auth0Id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              preferences: user.preferences,
              birthday: user.birthday,
              photoId: user.photoId,
              photoPreview: user.photoPreview,
              bio: user.bio,
              location: user.location,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            })
            .into(SQL_TABLES.USERS);
        } catch (e) {
          console.error('user migration error', user.id, e);
        }

        if (user.blockedUsers && user.blockedUsers.values) {
          const { values } = user.blockedUsers;
          const blockedInserts = values
            .filter(filterBadUuid)

            .filter(blockedId => blockedId !== 'placeholder')
            .map(blockedId => ({
              blockerId: user.id,
              blockedId,
            }));
          if (blockedInserts.length > 0) {
            try {
              await sql.insert(blockedInserts).into(SQL_TABLES.BLOCKED_USERS);
            } catch (e) {
              console.log('block user insert error', e);
            }
          }
        }
      });
    })
    .catch(e => {
      console.log('user scan error', e);
    });

const migrateDevices = () =>
  scan(DYNAMO_TABLES.DEVICE).then(async devices => {
    console.log('device count', devices.length);
    try {
      await sql
        .insert(
          devices.filter(filterBadUuidField('userId')).map(device => ({
            token: device.token,
            type: device.type,
            model: device.model,
            userId: device.userId,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
          }))
        )
        .into(SQL_TABLES.DEVICES);
    } catch (e) {
      console.log('device insert error', e);
    }
  });

const migrateActivities = () =>
  scan(DYNAMO_TABLES.ACTIVITY).then(async activities => {
    console.log('activity count', activities.length);
    try {
      await sql
        .insert(
          activities.filter(filterBadUuidField('id')).map(activity => ({
            id: activity.id,
            activityDate: activity.activityDate,
            title: activity.title,
            emoji: activity.emoji,
            description: activity.description,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
          }))
        )
        .into(SQL_TABLES.ACTIVITIES);
    } catch (e) {
      console.log('activity insert error', e);
    }
  });

const migrateEvents = () =>
  scan(DYNAMO_TABLES.EVENT).then(async events => {
    // Unique locations
    const uniqueLocs = uniqBy(
      events.filter(filterBadUuidField('id')).map(event => event.location),
      l => l.name
    ).map(l => {
      const loc = {
        id: uuid(),
        ...omit(l, ['foursquareVenueId', 'isFuzzed']),
      };
      locations[loc.name] = loc;
      return loc;
    });

    try {
      await sql.insert(uniqueLocs).into(SQL_TABLES.LOCATIONS);
    } catch (e) {
      console.log('location insert error', e);
    }

    try {
      await sql
        .insert(
          uniqBy(events, 'id')
            .filter(filterBadUuidField('id'))
            .filter(filterBadUuidField('activityId'))
            .map(event => ({
              id: event.id,
              activityId: event.activityId,
              locationId: locations[event.location.name].id,
              limit: event.limit,
              time: event.time,
              createdAt: event.createdAt,
              updatedAt: event.updatedAt,
            }))
        )
        .into(SQL_TABLES.EVENTS);
    } catch (e) {
      console.log('event insert error', e);
    }
  });

const migrateRsvps = () =>
  scan(DYNAMO_TABLES.RSVP).then(async rsvps => {
    console.log('rsvp count', rsvps.length);
    const now = new Date().toISOString();
    try {
      await Promise.all(
        rsvps
          .filter(filterBadUuidField('eventId'))
          .filter(filterBadUuidField('userId'))
          .map(rsvp =>
            sql
              .insert({
                id: uuid(), // turn ids into real uuids
                eventId: rsvp.eventId,
                userId: rsvp.userId,
                lastReadTs: rsvp.lastReadTs,
                action: rsvp.action,
                createdAt: rsvp.createdAt || now,
                updatedAt: rsvp.updatedAt || now,
              })
              .into(SQL_TABLES.RSVPS)
          )
      ).then(promises => {
        console.log('Inserted rsvps ', promises.length);
      });
    } catch (e) {
      console.log('message insert error', e);
    }
  });

const migrateMessages = () =>
  scan(DYNAMO_TABLES.MESSAGE).then(async messages => {
    console.log('message count', messages.length);
    try {
      await Promise.all(
        messages
          .filter(filterBadUuidField('eventId'))
          .filter(filterBadUuidField('userId'))
          .map(message =>
            sql
              .insert({
                id: message.id,
                ts: message.ts,
                eventId: message.eventId,
                userId: message.userId,
                text: message.text,
              })
              .into(SQL_TABLES.MESSAGES)
          )
      ).then(promises => {
        console.log('Inserted messages ', promises.length);
      });
    } catch (e) {
      console.log('message insert error', e);
    }
  });

migrateUsers()
  .then(() => migrateDevices())
  .then(() => migrateEvents())
  .then(() => migrateActivities())
  .then(() => migrateRsvps())
  .then(() => migrateMessages());
