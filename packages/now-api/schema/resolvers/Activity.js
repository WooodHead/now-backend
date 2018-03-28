import uuid from 'uuid';
import { get } from 'lodash';
import { LocalDate, ZoneOffset } from 'js-joda';

import { scan, put, getActivity } from '../../db';
import { paginatify } from '../util';
import { TABLES } from '../../db/constants';

const allActivities = () => scan(TABLES.ACTIVITY);
const activityQuery = (root, { id }) => getActivity(id);
const todayActivity = () =>
  allActivities().then(activities => {
    const now = LocalDate.now(ZoneOffset.UTC).toString();
    return activities.find(t => get(t, 'activityDate') === now);
  });

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
