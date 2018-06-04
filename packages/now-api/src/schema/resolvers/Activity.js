import uuid from 'uuid';
import { LocalDateTime, LocalTime, ZoneId } from 'js-joda';

import { sqlPaginatify } from '../util';
import { Activity, Event } from '../../db/repos';

const AVAILABILITY_HOUR = LocalTime.parse('21:00');

export const getToday = () => {
  const now = LocalDateTime.now(ZoneId.of('America/New_York'));
  return (now.toLocalTime().isBefore(AVAILABILITY_HOUR)
    ? now.toLocalDate()
    : now.toLocalDate().plusDays(1)
  ).toString();
};

const allActivities = (root, { input }) => {
  const { orderBy = 'id', ...pageParams } = input || {};
  return sqlPaginatify(orderBy, Activity.all({}), pageParams);
};

const manyActivities = (root, { ids }, { loaders }) =>
  loaders.activities.loadMany(ids);

const activityQuery = (root, { id }, { loaders }) =>
  loaders.activities.load(id);

const todayActivity = () => Activity.get({ activityDate: getToday() });

export const queries = {
  todayActivity,
  activity: activityQuery,
  allActivities,
  manyActivities,
};

export const getEvents = ({ id }, { first, last, after, before }) =>
  sqlPaginatify('id', Event.all({ activityId: id }), {
    first,
    last,
    after,
    before,
  });

export const resolvers = {
  events: getEvents,
};

const createActivity = (
  root,
  { input: { title, description, activityDate, emoji } },
  { loaders }
) => {
  const newId = uuid.v1();
  const ISOString = new Date().toISOString();
  const newActivity = {
    id: newId,
    title,
    description,
    activityDate: activityDate.toString(),
    createdAt: ISOString,
    updatedAt: ISOString,
    emoji,
  };

  loaders.activities.clear(newId);

  return Activity.insert(newActivity).then(() => ({
    activity: loaders.activities.load(newId),
  }));
};

export const mutations = { createActivity };
