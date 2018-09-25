// @flow
/* eslint-disable no-await-in-loop */
import AWS from 'aws-sdk';
import { max, sortBy } from 'lodash';
import { Instant } from 'js-joda';

import { eventTypes, getLogs } from '../auth0';
import logger from '../logger';
import { lastAuth0Entry } from '../db/serverState';

const cloudwatchLogs = new AWS.CloudWatchLogs({
  apiVersion: '2014-03-28',
  region: process.env.AWS_REGION,
});

const logGroupName = '/now/auth0';
const logStreamName = 'auth0-logs';

const ignoreAlreadyExistsException = e => {
  if (e.code !== 'ResourceAlreadyExistsException') {
    throw e;
  }
};

const getSequenceToken = async () => {
  await cloudwatchLogs
    .createLogGroup({ logGroupName })
    .promise()
    .catch(ignoreAlreadyExistsException);

  const { logStreams } = await cloudwatchLogs
    .describeLogStreams({
      logGroupName,
      logStreamNamePrefix: logStreamName,
    })
    .promise();
  const existingStream = logStreams.find(
    stream => stream.logStreamName === logStreamName
  );
  if (existingStream) {
    return existingStream.uploadSequenceToken;
  }
  await cloudwatchLogs
    .createLogStream({ logGroupName, logStreamName })
    .promise();

  return undefined;
};

export default async (): Promise<void> => {
  let since = await lastAuth0Entry.get();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [sequenceToken, logs] = await Promise.all([
      getSequenceToken(),
      getLogs(since),
    ]);
    if (!logs || logs.length === 0) {
      logger.info('no auth0 entries to send to cloudwatch logs');
      return;
    }

    await cloudwatchLogs
      .putLogEvents({
        logEvents: sortBy(
          logs.map(log => ({
            message: JSON.stringify({
              event_name: eventTypes[log.type],
              ...log,
            }),
            timestamp: Instant.parse(log.date).toEpochMilli(),
          })),
          'timestamp'
        ),
        logGroupName,
        logStreamName,
        sequenceToken,
      })
      .promise();

    const newSince = max(logs.map(({ _id }) => _id));
    await lastAuth0Entry.set(newSince, since);

    logger.info(`${logs.length} auth0 entries sent to cloudwatch logs`);
    if (logs.length < 100 || !since) {
      break;
    }
    since = newSince;
  }
};
