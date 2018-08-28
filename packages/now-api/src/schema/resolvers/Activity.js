import uuid from 'uuid';
import { LocalDateTime, LocalDate, ZoneId } from 'js-joda';

import { sqlPaginatify } from '../util';
import { Activity, Event } from '../../db/repos';
import sql from '../../db/sql';
import { notifyEventChange } from './Event';
import { setActivityHeaderPhoto } from './Photo';
import { expiredUserAgent } from '../../util';
import { AVAILABILITY_HOUR } from '../../db/constants';

export const NYC_TZ = ZoneId.of('America/New_York');

export const getToday = () => {
  const now = LocalDateTime.now(NYC_TZ);
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

const todayActivity = (root, args, { userAgent }) => {
  if (expiredUserAgent(userAgent)) {
    return null;
  }
  return Activity.get({ activityDate: getToday() });
};

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

const getHeaderPhoto = ({ headerPhotoId, headerPhotoPreview }) => {
  if (headerPhotoId) {
    return {
      id: headerPhotoId,
      preview: headerPhotoPreview,
      baseUrl: 'https://now.meetup.com/images',
      blocked: false,
    };
  }
  return null;
};

const getGenerallyAvailableAt = () =>
  LocalDate.now()
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
