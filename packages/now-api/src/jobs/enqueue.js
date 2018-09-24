// @flow
import AWS from 'aws-sdk';
import type { JobRequest } from '.';
import { handleJob } from './dequeue';
import { promiseDelay } from '../util';
import logger from '../logger';

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const { SQS_QUEUE_URL } = process.env;

const sqsEnqueue = ({ delay, ...data }: JobRequest) => {
  const message = {};
  message.MessageBody = JSON.stringify(data);
  message.QueueUrl = SQS_QUEUE_URL;

  if (typeof delay === 'number') {
    message.DelaySeconds = Math.min(Math.floor(delay), 900);
  }

  return sqs
    .sendMessage(message)
    .promise()
    .then(response => {
      logger.verbose(response);
    }, logger.error);
};

const directHandle = ({ delay = 0, ...data }: JobRequest) =>
  // $FlowFixMe
  promiseDelay(delay * 1000).then(() => handleJob(data));

const enqueue: JobRequest => Promise<any> = SQS_QUEUE_URL
  ? sqsEnqueue
  : directHandle;

export default enqueue;
