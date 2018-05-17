import DataLoader from 'dataloader';
import { getUserBatch } from '../schema/resolvers/User';

export default ({ currentUserId }) => ({
  members: new DataLoader(ids => getUserBatch(ids, currentUserId), {
    maxBatchSize: 100,
  }),
});
