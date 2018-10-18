// @flow
import AWS from 'aws-sdk';

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const submissionArn = 'arn:aws:sns:us-east-1:212646169882:now-submissions';

type Args = {
  submissionId: string,
  body: string,
  user: { firstName: string, lastName: string },
};

export default ({ submissionId, body, user }: Args): Promise<void> => {
  if (!submissionId || !body) {
    throw new Error('invalid args');
  }

  if (process.env.NOTIFY_SUBMISSIONS !== 'true') {
    return Promise.resolve();
  }

  const username =
    user && user.firstName
      ? `${user.firstName} ${user.lastName}`
      : 'Unknown user';
  const url = `https://now.meetup.com/admin/#/Submission/${submissionId}/show`;

  const Subject = `New submission from ${username}`;
  const Message = JSON.stringify({
    default: `${Subject}\n${url}`,
    email: `${Subject}\n\n${body}\n\n${url}`,
  });

  return SNS.publish({
    Message,
    Subject,
    MessageStructure: 'json',
    TopicArn: submissionArn,
  }).promise();
};
