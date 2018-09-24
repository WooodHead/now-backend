/* eslint-disable import/prefer-default-export */
import snsPublish from 'aws-sns-publish';
import { userIdFromContext } from '../util';
import logger from '../../logger';

const createReport = (root, { input: { data } }, context) => {
  snsPublish(`${userIdFromContext(context)}: ${JSON.stringify(data)}`, {
    arn:
      'arn:aws:sns:us-east-1:212646169882:nowreport:9c304f43-d848-4a7c-82e7-f4ffe81b7a42',
  }).catch(logger.error);

  return { data: 'OK' };
};

export const mutations = { createReport };
