module.exports = `
  scalar GraphQLDate
  scalar GraphQLTime
  scalar GraphQLDateTime
  
  type Query {
    allEvents: [Event]
    event(id: String): Event
  }

  type User {
    id: String!
    email: String
    meetupId: String
    slackId: String
    events: [Event]
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }
  type Event {
    id: String!
    attendeeCount: Int
    chatChannel: String
    postChannel: String
    description: String
    limit: Int
    slug: String
    title: String
    duration: Int
    creator: [User]
    activity: Activity
    attendees: [User]
    users: [User]
    reminders: [Reminder]
    time: GraphQLDateTime
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }
  type Reminder {
    type: String
    sent: Boolean
    sentDate: GraphQLDateTime
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }
  type Activity {
    id: String!
    title: String
    slug: String
    description: String
    limit: String
    duration: String
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime    
  }
  type Rsvp {
    id: String!
    user: User
    event: Event
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }
  type Message {
    id: String!
    text: String
    user: User
    event: Event
    ts: String
  }
`;
