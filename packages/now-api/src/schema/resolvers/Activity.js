import uuid from 'uuid';
import { LocalDateTime, LocalTime, ZoneId } from 'js-joda';

import { sqlPaginatify } from '../util';
import { Activity, Event } from '../../db/repos';
import sql from '../../db/sql';

const AVAILABILITY_HOUR = LocalTime.parse('21:00');

export const getToday = () => {
  const now = LocalDateTime.now(ZoneId.of('America/New_York'));
  return (now.toLocalTime().isBefore(AVAILABILITY_HOUR)
    ? now.toLocalDate()
    : now.toLocalDate().plusDays(1)
  ).toString();
};

const allActivities = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Activity.all({}), input);

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
  { input: { title, description, activityDate, emoji, pushNotification } },
  { loaders }
) => {
  const newId = uuid.v1();
  const newActivity = {
    id: newId,
    title,
    pushNotification,
    description,
    activityDate: activityDate.toString(),
    createdAt: sql.raw('now()'),
    updatedAt: sql.raw('now()'),
    emoji,
  };

  loaders.activities.clear(newId);

  return Activity.insert(newActivity).then(() => ({
    activity: loaders.activities.load(newId),
  }));
};

const updateActivity = (
  root,
  { input: { id, title, description, activityDate, emoji, pushNotification } },
  { loaders }
) => {
  const updatedActivity = {
    id,
    title,
    pushNotification,
    description,
    activityDate: activityDate.toString(),
    updatedAt: sql.raw('now()'),
    emoji,
  };

  loaders.activities.clear(id);

  return Activity.update(updatedActivity).then(() => ({
    activity: loaders.activities.load(id),
  }));
};

export const mutations = { createActivity, updateActivity };
