import DataLoader from 'dataloader';
import { getUserBatch } from '../schema/resolvers/User';
import {
  Event,
  Activity,
  Rsvp,
  Location,
  Invitation,
  Community,
  Membership,
} from './repos';

const maxBatchSize = 100;
export default ({ currentUserId }) => ({
  members: new DataLoader(ids => getUserBatch(ids, currentUserId), {
    maxBatchSize,
  }),
  events: new DataLoader(ids => Event.batch(ids), {
    maxBatchSize,
  }),
  locations: new DataLoader(ids => Location.batch(ids), {
    maxBatchSize,
  }),
  activities: new DataLoader(ids => Activity.batch(ids), {
    maxBatchSize,
  }),
  rsvps: new DataLoader(ids => Rsvp.batch(ids), {
    maxBatchSize,
  }),
  invitations: new DataLoader(ids => Invitation.batch(ids), {
    maxBatchSize,
  }),
  communities: new DataLoader(ids => Community.batch(ids), {
    maxBatchSize,
  }),
  userMemberships: new DataLoader(
    ids => Promise.all(ids.map(id => Membership.all({ userId: id }))),
    {
      maxBatchSize,
    }
  ),
});
