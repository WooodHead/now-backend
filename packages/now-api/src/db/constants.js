import { LocalTime } from 'js-joda';

export const SQL_TABLES = {
  USERS: 'users',
  COMMUNITIES: 'communities',
  MEMBERSHIPS: 'memberships',
  MEMBERSHIP_LOG: 'membershipLog',
  BLOCKED_USERS: 'blockedUsers',
  DEVICES: 'devices',
  ACTIVITIES: 'activities',
  LOCATIONS: 'locations',
  EVENTS: 'events',
  MESSAGES: 'messages',
  RSVPS: 'rsvps',
  RSVP_LOG: 'rsvpLog',
  INVITATIONS: 'invitations',
  INVITATION_LOG: 'invitationLog',
  EVENT_USER_METADATA: 'eventUserMetadata',
  SENT_NOTIFICATIONS: 'sentNotifications',
  SERVER_MESSAGES: 'serverMessages',
  SERVER_STATE: 'serverState',
};

export const NOW_BOT_USER_ID = 'ec6c81d8-7bb4-11e8-ba5d-2bc28925de05';
export const DELETED_USER_ID = '7cb43790-3bed-4e23-9825-43d913074ee0';
export const GLOBAL_COMMUNITY_ID = '89b4d825-1b46-4eb8-8e3f-f6b7e30d0296';

export const SPECIAL_USER_IDS = [NOW_BOT_USER_ID, DELETED_USER_ID];

export const NOTIFICATION_PREFERENCE_MESSAGES = 'messagesNotification';
export const NOTIFICATION_PREFERENCE_NEW_EVENT = 'newEventNotification';
export const NOTIFICATION_PREFERENCE_REMINDERS = 'remindersNotification';

export const AVAILABILITY_HOUR = LocalTime.parse(
  process.env.AVAILABILITY_HOUR || '21:00'
);
export const EARLY_AVAILABILITY_HOUR = LocalTime.parse(
  process.env.EARLY_AVAILABILITY_HOUR || '20:00'
);
