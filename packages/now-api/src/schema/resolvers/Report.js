/* eslint-disable import/prefer-default-export */
import snsPublish from 'aws-sns-publish';
import { userIdFromContext } from '../util';
import logger from '../../logger';

const createReport = (root, { input: { data } }, context) => {
  let messageText = `Reported by: ${userIdFromContext(context)} \n`;
  if (data.eventId) {
    messageText += `\nEvent admin: https://now.meetup.com/admin#/Event/${
      data.eventId
    }/show \n`;
  }
  messageText += `\n${JSON.stringify(data)}`;
  snsPublish(messageText, {
    arn: 'arn:aws:sns:us-east-1:212646169882:nowreport',
  }).catch(logger.error);

  return { data: 'OK' };
};

export const mutations = { createReport };
