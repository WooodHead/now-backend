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

const allActivities = () => Activity.all();
const activityQuery = (root, { id }) => Activity.byId(id);
const todayActivity = () => Activity.get({ activityDate: getToday() });

export const queries = {
  todayActivity,
  activity: activityQuery,
  allActivities,
};

export const getEvents = ({ id }, { first, last, after, before }) =>
  sqlPaginatify(
    'id',
    Event.all(
      { activityId: id },
      {
        first,
        last,
        after,
        before,
      }
    )
  );

export const resolvers = {
  events: getEvents,
};

const createActivity = (
  root,
  { input: { title, description, activityDate, emoji } }
) => {
  const newId = uuid.v1();
  const ISOString = new Date().toISOString();
  const newActivity = {
    id: newId,
    title,
    description,
    activityDate: activityDate.toISOString().substring(0, 10),
    createdAt: ISOString,
    updatedAt: ISOString,
    emoji,
  };
  return Activity.insert(newActivity).then(() => ({
    activity: Activity.byId(newId),
  }));
};

export const mutations = { createActivity };
