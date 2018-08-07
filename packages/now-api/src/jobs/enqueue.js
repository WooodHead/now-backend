// @flow
import AWS from 'aws-sdk';
import type { JobRequest } from '.';
import { handleJob } from './dequeue';

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const { SQS_QUEUE_URL } = process.env;

const sqsEnqueue = data =>
  sqs.sendMessage({
    MessageBody: JSON.stringify(data),
    QueueUrl: SQS_QUEUE_URL,
  });

const enqueue: JobRequest => Promise<any> = SQS_QUEUE_URL
  ? sqsEnqueue
  : handleJob;

export default enqueue;
