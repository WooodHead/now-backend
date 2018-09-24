// @flow
import { randomBytes } from 'crypto';
import * as winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: process.env.VERBOSE ? 'verbose' : 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ message: true }),
        winston.format.simple()
      ),
    }),
  ],
});

const envName = process.env.EB_ENVIRONMENT_NAME;

if (process.env.NODE_ENV === 'production' && envName) {
  const logStreamName =
    process.env.EC2_INSTANCE_ID || randomBytes(16).toString('hex');

  logger.add(
    new WinstonCloudWatch({
      logGroupName: `/now/${envName}`,
      logStreamName,
      jsonMessage: true,
      retentionInDays: 180,
      awsRegion: process.env.AWS_REGION,
    })
  );
}

export default logger;
