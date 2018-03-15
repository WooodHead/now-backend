import { scan } from '../../db';
import { parseDate } from '../../db/util';

const transformActivity = activity => ({
  id: activity.id,
  title: activity.title,
  slug: activity.slug,
  description: activity.description,
  limit: activity.limit,
  duration: activity.duration,
  createdAt: parseDate(activity.createdAt),
  updatedAt: parseDate(activity.updatedAt),
  emoji: activity.emoji,
});

const transformActivities = events => events.map(transformActivity);

export const activities = () => scan('now_table').then(transformActivities);
export const activity = slug =>
  activities().then(all => all.find(a => slug === a.slug));
