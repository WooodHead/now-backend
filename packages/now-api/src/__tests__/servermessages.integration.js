import gql from 'graphql-tag';

import uuid from 'uuid/v4';
import { SQL_TABLES } from '../db/constants';
import { client, userAgentClient } from '../db/mock';
import sql from '../db/sql';
import { MIN_ANDROID, MIN_IOS } from '../util';

const truncateTables = () =>
  Promise.all([sql(SQL_TABLES.SERVER_MESSAGES).truncate()]);

const messages = Object.entries({
  noActivityTitle: 'no activity title',
  noActivityMessage: 'no activity message',
  inviteExplain: 'invite explain',
  inviteInstructions: 'invite instructions',
  inviteExpire: 'invite expire',
  oldClientTitle: 'old client title',
  oldClientMessageIos: 'old client message ios',
  oldClientMessageAndroid: 'old client message android',
}).map(([key, text]) => ({
  id: uuid(),
  key,
  text,
}));

beforeAll(() =>
  truncateTables().then(() =>
    sql(SQL_TABLES.SERVER_MESSAGES).insert(messages)
  ));
afterAll(() => truncateTables());

const query = gql`
  query serverMessages {
    serverMessages {
      inviteExpire
      inviteExplain
      inviteInstructions
      noActivityMessage
      noActivityTitle
    }
  }
`;

describe('server messages', () => {
  it('gives the default messages', async () => {
    const { data } = await client.query({ query });
    expect(data.serverMessages).toMatchObject({
      noActivityTitle: 'no activity title',
      noActivityMessage: 'no activity message',
      inviteExplain: 'invite explain',
      inviteInstructions: 'invite instructions',
      inviteExpire: 'invite expire',
    });
  });

  it('ignores an up-to-date UA', async () => {
    const { data } = await userAgentClient({
      client: 'Meetup-Now',
      buildNumber: MIN_ANDROID,
      platform: 'Android',
    }).query({ query });
    expect(data.serverMessages).toMatchObject({
      noActivityTitle: 'no activity title',
      noActivityMessage: 'no activity message',
      inviteExplain: 'invite explain',
      inviteInstructions: 'invite instructions',
      inviteExpire: 'invite expire',
    });
  });

  it('notes an out-of-date Android UA', async () => {
    const { data } = await userAgentClient({
      client: 'Meetup-Now',
      buildNumber: MIN_ANDROID - 1,
      platform: 'Android',
    }).query({ query });
    expect(data.serverMessages).toMatchObject({
      noActivityTitle: 'old client title',
      noActivityMessage: 'old client message android',
      inviteExplain: 'invite explain',
      inviteInstructions: 'invite instructions',
      inviteExpire: 'invite expire',
    });
  });

  it('notes an out-of-date iOS UA', async () => {
    const { data } = await userAgentClient({
      client: 'Meetup-Now',
      buildNumber: MIN_IOS - 1,
      platform: 'Ios',
    }).query({ query });
    expect(data.serverMessages).toMatchObject({
      noActivityTitle: 'old client title',
      noActivityMessage: 'old client message ios',
      inviteExplain: 'invite explain',
      inviteInstructions: 'invite instructions',
      inviteExpire: 'invite expire',
    });
  });
});
