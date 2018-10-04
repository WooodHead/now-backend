import uuid from 'uuid';
import { LocalDateTime, ZoneId } from 'js-joda';

import { sqlPaginatify } from '../util';
import { Activity, Event } from '../../db/repos';
import sql from '../../db/sql';
import { notifyEventChange } from './Event';
import { setActivityHeaderPhoto } from './Photo';

export const NYC_TZ = ZoneId.of('America/New_York');

const allActivities = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Activity.all({}), input);

const manyActivities = (root, { ids }, { loaders }) =>
  loaders.activities.loadMany(ids);

const activityQuery = (root, { id }, { loaders }) =>
  loaders.activities.load(id);

export const queries = {
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

const getHeaderPhoto = ({ headerPhotoId, headerPhotoPreview }, args, ctx) => {
  if (headerPhotoId) {
    return {
      id: headerPhotoId,
      preview: headerPhotoPreview,
      baseUrl: ctx.imageUrl,
      blocked: false,
    };
  }
  return null;
};

const getGenerallyAvailableAt = () =>
  LocalDateTime.now(NYC_TZ)
    .toLocalDate()
    .atStartOfDay()
    .atZone(NYC_TZ);

export const resolvers = {
  header: getHeaderPhoto,
  events: getEvents,
  generallyAvailableAt: getGenerallyAvailableAt,
};

const createActivity = async (
  root,
  {
    input: {
      title,
      description,
      activityDate,
      emoji,
      pushNotification,
      header,
    },
  },
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

  if (header) {
    const { preview, key } = await setActivityHeaderPhoto(newId, header);
    newActivity.headerPhotoId = key;
    newActivity.headerPhotoPreview = preview;
  }

  return Activity.insert(newActivity).then(() => ({
    activity: loaders.activities.load(newId),
  }));
};

const updateActivity = async (
  root,
  {
    input: {
      id,
      title,
      description,
      activityDate,
      emoji,
      pushNotification,
      header,
    },
  },
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

  if (header) {
    const { preview, key } = await setActivityHeaderPhoto(id, header);
    updatedActivity.headerPhotoId = key;
    updatedActivity.headerPhotoPreview = preview;
  }

  await Activity.update(updatedActivity);
  const activityEvents = await Event.all({ activityId: id });

  activityEvents.forEach(({ id: eventId }) => {
    notifyEventChange(eventId);
  });

  return {
    activity: loaders.activities.load(id),
  };
};

export const mutations = { createActivity, updateActivity };
