// @flow
import sql from './sql';
import { SQL_TABLES } from './constants';

class ServerState {
  constructor(key: string) {
    this.key = key;
  }

  get = (): Promise<?string> =>
    sql(SQL_TABLES.SERVER_STATE)
      .where({ key: this.key })
      .then(results => {
        if (results.length === 1) {
          return results[0].value;
        }
        return undefined;
      });

  set = async (value: string, prevValue: ?string = null): Promise<void> => {
    const actualPrev = prevValue === null ? await this.get() : prevValue;
    return actualPrev !== undefined
      ? sql(SQL_TABLES.SERVER_STATE)
          .where({ key: this.key })
          .update({ value, updatedAt: sql.raw('now()') })
      : sql(SQL_TABLES.SERVER_STATE).insert({ key: this.key, value });
  };

  key: string;
}

export const lastAuth0Entry = new ServerState('last_auth0_entry');
export const testValue = new ServerState('test_value');
