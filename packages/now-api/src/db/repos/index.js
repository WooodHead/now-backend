// @flow
import type knex from 'knex';

import defaultSql from '../sql';
import { SQL_TABLES } from '../constants';
import { putInOrder } from '../../util';

type flat = string | number;

class Repo {
  constructor(table: string, sql: knex = defaultSql) {
    this.table = table;
    this.sql = sql;
  }

  get = (query: mixed = {}) =>
    this.sql(this.table)
      .where(query)
      .first();

  all = (query: mixed = {}) => this.sql(this.table).where(query);

  insert = (obj: mixed) => this.sql(this.table).insert(obj);

  update = ({ id, ...otherFields }: { id: flat }) =>
    this.sql(this.table)
      .where({ id })
      .update(otherFields);

  batch = (ids: Array<flat>) =>
    this.sql(this.table) // TODO: log batch savings
      .whereIn('id', ids)
      .then(batch => putInOrder(batch, ids));

  delete = (query: mixed) =>
    this.sql(this.table)
      .where(query)
      .delete();

  byId = (id: flat) => this.get({ id });

  withTransaction = (trx: ?knex): Repo =>
    trx ? new Repo(this.table, trx) : this;

  sql: knex;
  table: string;
}

export const User = new Repo(SQL_TABLES.USERS);
export const Device = new Repo(SQL_TABLES.DEVICES);
export const Activity = new Repo(SQL_TABLES.ACTIVITIES);
export const Event = new Repo(SQL_TABLES.EVENTS);
export const Location = new Repo(SQL_TABLES.LOCATIONS);
export const Rsvp = new Repo(SQL_TABLES.RSVPS);
export const RsvpLog = new Repo(SQL_TABLES.RSVP_LOG);
export const Message = new Repo(SQL_TABLES.MESSAGES);
export const Invitation = new Repo(SQL_TABLES.INVITATIONS);
export const EventUserMetadata = new Repo(SQL_TABLES.EVENT_USER_METADATA);
export const ServerMessages = new Repo(SQL_TABLES.SERVER_MESSAGES);
