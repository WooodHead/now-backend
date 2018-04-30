import uuid from 'uuid';
import { get } from 'lodash';
import { LocalDateTime, LocalTime, ZoneId } from 'js-joda';

import { scan, put, getActivity } from '../../db';
import { paginatify } from '../util';
import { TABLES } from '../../db/constants';

const AVAILABILITY_HOUR = LocalTime.parse('21:00');

export const getToday = () => {
  const now = LocalDateTime.now(ZoneId.of('America/New_York'));
  return (now.toLocalTime().isBefore(AVAILABILITY_HOUR)
    ? now.toLocalDate()
    : now.toLocalDate().plusDays(1)
  ).toString();
};

const allActivities = () => scan(TABLES.ACTIVITY);
const activityQuery = (root, { id }) => getActivity(id);
const todayActivity = () =>
  allActivities().then(activities =>
    activities.find(t => get(t, 'activityDate') === getToday())
  );

export const queries = {
  todayActivity,
  activity: activityQuery,
  allActivities,
};

export const getEvents = ({ id }, { first, last, after, before }) =>
  paginatify(
    {
      expr: 'activityId = :activityId',
      exprValues: { ':activityId': id },
      tableName: TABLES.EVENT,
      cursorId: 'id',
    },
    {
      first,
      last,
      after,
      before,
    }
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
  return put(TABLES.ACTIVITY, newActivity).then(() => ({
    activity: getActivity(newId),
  }));
};

export const mutations = { createActivity };
