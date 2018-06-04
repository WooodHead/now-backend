import { mergeTypes } from 'merge-graphql-schemas';

import base from './typeDefs.graphql';
import activity from './activity.graphql';
import event from './event.graphql';
import rsvp from './rsvp.graphql';
import location from './location.graphql';

export default mergeTypes([base, activity, event, rsvp, location], {
  all: true,
});
