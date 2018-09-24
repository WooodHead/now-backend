// @flow
import logger from '../logger';

export default (): Promise<void> => {
  logger.info('hi!!!');
  return Promise.resolve();
};
