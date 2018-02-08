import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const promisify = foo =>
  new Promise((resolve, reject) => {
    foo((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

const get = (table, key = {}) =>
  promisify(callback =>
    dynamoDb.get(
      {
        TableName: table,
        Key: key,
      },
      callback
    )
  ).then(response => response.Item);
const scan = table =>
  promisify(callback =>
    dynamoDb.scan(
      {
        TableName: table,
      },
      callback
    )
  ).then(response => response.Items);

export const parseDate = date =>
  date === null ? null : new Date(parseInt(date, 10));

const transformEvent = event => ({
  id: event.id,
  title: event.title,
  description: event.description,
  limit: event.limit,
  slug: event.slug,
  time: parseDate(event.time),
  chatChannel: event.channel_id,
  duration: event.duration,
  createdAt: parseDate(event.createdAt),
  updatedAt: parseDate(event.updatedAt),
});

const transformEvents = events => events.map(transformEvent);

const transformActivity = activity => ({
  id: activity.id,
  title: activity.title,
  slug: activity.slug,
  description: activity.description,
  limit: activity.limit,
  duration: activity.duration,
  createdAt: parseDate(activity.createdAt),
  updatedAt: parseDate(activity.updatedAt),
});

const transformActivities = events => events.map(transformActivity);

const events = () => scan('now').then(transformEvents);

const rawEvent = id => get('now', { id });
const event = id => rawEvent(id).then(transformEvent);

const activities = () => scan('now_table').then(transformActivities);
const activity = slug =>
  activities().then(all => all.find(a => slug === a.slug));

export default {
  events,
  rawEvent,
  event,
  activities,
  activity,
};
