import { mergeTypes } from 'merge-graphql-schemas';

import base from './typeDefs.graphql';
import activity from './activity.graphql';
import event from './event.graphql';
import rsvp from './rsvp.graphql';
import location from './location.graphql';
import invitation from './invitation.graphql';

export default mergeTypes([base, activity, event, rsvp, location, invitation], {
  all: true,
});
