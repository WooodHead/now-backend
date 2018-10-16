import { Duration } from 'js-joda';

export const fieldOrder = [
  'eventWhen',
  'eventWhere',
  'eventSize',
  'eventWhat',
  'eventWho',
  'eventHow',
  'eventTitle',
];

const duration = (h, m) =>
  Duration.ofHours(h)
    .plusMinutes(m)
    .toMillis();

export const exhibitFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d511',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to visit the museum exhibit?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Sun Sep 11, 1:00 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 45),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148611',
    type: 'Location',
    params: {
      header: 'Where is the museum exhibit?',
      nameLabel: 'Location Name',
      namePlaceholder: 'Metropolitan Museum of Art',
      addressLabel: 'Location Address',
      addressPlaceholder: '1000 5th Ave, New York, NY 10028',
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb311',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de011',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited about the museum exhibit and give them a little bit of background on what the museum exhibit is. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242011',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this activity is for, whether it’s avid museum goers, someone who’s just interested in this particular exhibit, or all the above. `,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701011',
    type: 'Text',
    params: {
      header: 'Anything museum goers should know?',
      placeholder: `Let members know how much admission tickets cost, if they’ll need to bring anything with them, if they need to be prepared for long lines, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1311',
    type: 'Text',
    params: {
      header: 'Finally, give your museum adventure a title',
      placeholder: `Explore The Heavenly Bodies Exhibit At The MET Museum`,
      maxLength: 70,
    },
  },
};

export const neighborhoodFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d522',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to explore?',
      dateLabel: 'Date and Time',
      datePlaceholder: `Sun Sep 11, 1:30 p.m.`,
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148622',
    type: 'Location',
    params: {
      header: 'Where do you want to start exploring?',
      nameLabel: 'Location Name',
      namePlaceholder: `Joe’s Shanghai`,
      addressLabel: 'Location Address',
      addressPlaceholder: `136-21 37th Avenue, Flushing`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb322',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de022',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited about exploring this particular area, where to meet you, and what other places in the area you plan on checking out. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242022',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this activity is for, whether it’s people who’ve never been to that area, people who live there and want to meet their neighbors, or just anyone who’s interested in exploring that area with others.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701022',
    type: 'Text',
    params: {
      header: 'Anything people joining should know?',
      placeholder: `Let members know if they’ll need to have cash on them for certain bars/restaurants, if they need to be prepared for long lines, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1322',
    type: 'Text',
    params: {
      header: 'Finally, give your neighborhood tour a name',
      placeholder: `Explore Flushing, Queens With A Dumpling Food Crawl`,
      maxLength: 70,
    },
  },
};

export const movieFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d533',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to see the movie?',
      dateLabel: 'Date and Time',
      datePlaceholder: `Thu Sep 8, 7:30 p.m.`,
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148633',
    type: 'Location',
    params: {
      header: 'Which theater do you want to go to?',
      nameLabel: 'Location Name',
      namePlaceholder: `AMC Kips Bay 15`,
      addressLabel: 'Location Address',
      addressPlaceholder: `570 2nd Ave, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb333',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de033',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited about seeing this movie, what designated spot to meet you at — one that will be easy to find, and whether you’d like to discuss the movie before/after seeing it. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242033',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this activity is for, whether it’s people who’ve been obsessively waiting for the movie to come out, people who know nothing about the movie but want to see it, or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701033',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know how much the movie tickets costs, if you’ll be buying the tickets together, if they’ll need to bring anything with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1333',
    type: 'Text',
    params: {
      header: 'Finally, give your theater visit a title',
      placeholder: `Calling All Avengers Fans! Let’s See The Movie Together`,
      maxLength: 70,
    },
  },
};

export const tvFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d544',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to watch the show?',
      dateLabel: 'Date and Time',
      datePlaceholder: `Thu Sep 8, 7:30 p.m.`,
      durationLabel: 'Duration',
      defaultDuration: duration(1, 45),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148644',
    type: 'Location',
    params: {
      header: 'Where do you want to watch it?',
      nameLabel: 'Location Name',
      namePlaceholder: `Meetup HQ`,
      addressLabel: 'Location Address',
      addressPlaceholder: `632 Broadway, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb344',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de044',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited about watching this show and which episodes you’ll watch together. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242044',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this activity is for whether it’s people who’ve been obsessively waiting for this show to come back, people who who know nothing about the show, or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701044',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if they’ll need to bring drinks and popcorn with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1344',
    type: 'Text',
    params: {
      header: 'Finally, give your show-watching party a title',
      placeholder: `Come Watch The Game Of Thrones Season Premiere`,
      maxLength: 70,
    },
  },
};

export const amaFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d555',
    type: 'DateTimeDuration',
    params: {
      header: 'When is your AMA?',
      dateLabel: 'Date and Time',
      datePlaceholder: `Thu Sep 8, 6:30 p.m.`,
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148655',
    type: 'Location',
    params: {
      header: 'Where do you want to have it?',
      nameLabel: 'Location Name',
      namePlaceholder: `WeWork Dumbo Heights`,
      addressLabel: 'Location Address',
      addressPlaceholder: `81 Prospect St, Brooklyn`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb355',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de055',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited to share your identity and experiences with them, what types of questions they’re welcome to ask, and what you hope they’ll take away from the conversation. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242055',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this AMA is and isn’t for.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701055',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if they’ll need special instructions to access the location, if they’ll need to bring anything with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1355',
    type: 'Text',
    params: {
      header: 'Finally, give your AMA a title',
      placeholder: `Ask Me Anything About Being Raised By Immigrant Parents`,
      maxLength: 70,
    },
  },
};

export const onlyOneFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d566',
    type: 'DateTimeDuration',
    params: {
      header: 'When is your discussion?',
      dateLabel: 'Date and Time',
      datePlaceholder: `Thu Sep 8, 6:30 p.m.`,
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148666',
    type: 'Location',
    params: {
      header: 'Where do you want to have it?',
      nameLabel: 'Location Name',
      namePlaceholder: `WeWork Chelsea`,
      addressLabel: 'Location Address',
      addressPlaceholder: `115 W 18th St, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb366',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de066',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited to connect about the things you feel alone in, what topics you want to cover, and what you hope they’ll take away from the conversation. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242066',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this discussion is and isn’t for. `,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701066',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if they’ll need special instructions to access the location, if they’ll need to bring anything with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1366',
    type: 'Text',
    params: {
      header: 'Finally, give your discussion a title',
      placeholder: `Am I The Only One Who Has A Love/Hate Relationship With NYC`,
      maxLength: 70,
    },
  },
};

export const discussFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d577',
    type: 'DateTimeDuration',
    params: {
      header: 'When is your discussion?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Thu Sep 8, 6:30 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148677',
    type: 'Location',
    params: {
      header: 'Where do you want to have it?',
      nameLabel: 'Location Name',
      namePlaceholder: `Meetup HQ`,
      addressLabel: 'Location Address',
      addressPlaceholder: `632 Broadway, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb377',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de077',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members what topics you’re excited to talk about, why you think those topics are important, and what you hope they’ll take away from the conversation. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242077',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who this discussion is and isn’t for.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701077',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if they’ll need special instructions to access the location, if they’ll need to bring anything with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1377',
    type: 'Text',
    params: {
      header: 'Finally, give your discussion a title',
      placeholder: `Let’s Discuss How To Travel Through Europe On A Budget`,
      maxLength: 70,
    },
  },
};

export const debateFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d588',
    type: 'DateTimeDuration',
    params: {
      header: 'When is your discussion?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Thu Sep 8, 6:30 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148688',
    type: 'Location',
    params: {
      header: 'Where do you want to have it?',
      nameLabel: 'Location Name',
      namePlaceholder: `WeWork Times Square`,
      addressLabel: 'Location Address',
      addressPlaceholder: `1460 Broadway, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb388',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de088',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members what topic you’re excited to debate on, the rules of the debate, and what you hope they’ll take away from the conversation. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242088',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Let members know who is and isn’t allowed to join this debate.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701088',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if they’ll need to bring anything with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1388',
    type: 'Text',
    params: {
      header: 'Finally, give your discussion a title',
      placeholder: `Should Brands Like Nike Take A Stance On Political Issues`,
      maxLength: 70,
    },
  },
};

export const gamesFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d599',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to game?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Thu Sep 8, 6:30 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148699',
    type: 'Location',
    params: {
      header: 'Where do you want to game?',
      nameLabel: 'Location Name',
      namePlaceholder: `WeWork Chelsea`,
      addressLabel: 'Location Address',
      addressPlaceholder: `115 W 18th St, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb399',
    type: 'NumberRange',
    params: {
      header: 'How many players can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de099',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members what board game(s) you’re excited to play and a brief explanation of the game(s). Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242099',
    type: 'Text',
    params: {
      header: `Who can play?`,
      placeholder: `Let members know who this activity is for whether it’s people who already know how to play the game(s), people who are new to the game(s), or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701099',
    type: 'Text',
    params: {
      header: 'Anything gamers should know?',
      placeholder: `Let members know if they’ll need to bring anything with them, like drinks or snacks, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1399',
    type: 'Text',
    params: {
      header: 'Finally, give your board game hangout a title',
      placeholder: `Let’s Play The Settlers Of Catan, A Strategy Board Game`,
      maxLength: 70,
    },
  },
};

export const sportsFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d500',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to play?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Sat Sep 10, 2:00 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba148600',
    type: 'Location',
    params: {
      header: 'Where do you want to play?',
      nameLabel: 'Location Name',
      namePlaceholder: `Sheep Meadow`,
      addressLabel: 'Location Address',
      addressPlaceholder: `1802 65th St Transverse, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb300',
    type: 'NumberRange',
    params: {
      header: 'How many players can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de000',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members what sport you’re excited to play and what designated spot to meet you at — one that will be easy to find. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242000',
    type: 'Text',
    params: {
      header: `Who can play?`,
      placeholder: `Let members know what skill level this activity is for, whether it’s beginner, intermediate, advanced, or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701000',
    type: 'Text',
    params: {
      header: 'Anything players should know?',
      placeholder: `Let members know if they’ll need to bring anything with them, like water, a certain shirt color, a ball, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1300',
    type: 'Text',
    params: {
      header: 'Finally, give your pickup game a title',
      placeholder: `Come Play Pickup Soccer In Central Park`,
      maxLength: 70,
    },
  },
};

export const skillsFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d5aa',
    type: 'DateTimeDuration',
    params: {
      header: 'When is your activity?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Sun Sep 11, 3:30 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 45),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba1486aa',
    type: 'Location',
    params: {
      header: 'Where is your activity?',
      nameLabel: 'Location Name',
      namePlaceholder: `WeWork Dumbo Heights`,
      addressLabel: 'Location Address',
      addressPlaceholder: `81 Prospect St, Brooklyn`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb3aa',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de0aa',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members what skill you’re interested in sharing/teaching, a brief explanation of why you think that skill is important, and what you hope they’ll get from attending. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f2420aa',
    type: 'Text',
    params: {
      header: `Who can join?`,
      placeholder: `Let members know who this activity is for whether it’s people who already know have experience with the skill, people who are new to the skill, or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff7010aa',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if the activity will cost money, if they’ll need to bring materials with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb13aa',
    type: 'Text',
    params: {
      header: 'Finally, give your activity a title',
      placeholder: `Learn How To Hem Your Clothing In A Few Easy Steps`,
      maxLength: 70,
    },
  },
};

export const hobbyFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d5bb',
    type: 'DateTimeDuration',
    params: {
      header: 'When is your activity?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Sun Sep 11, 3:30 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 45),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba1486bb',
    type: 'Location',
    params: {
      header: 'Where is your activity?',
      nameLabel: 'Location Name',
      namePlaceholder: `WeWork Dumbo Heights`,
      addressLabel: 'Location Address',
      addressPlaceholder: `81 Prospect St, Brooklyn`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb3bb',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de0bb',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members what ritual or hobby you’re interested in sharing/teaching, a brief explanation of why you think that ritual or hobby is important, and what you hope they’ll get from attending. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f2420bb',
    type: 'Text',
    params: {
      header: `Who can join?`,
      placeholder: `Let members know who this activity is for whether it’s people who already have experience with the ritual or hobby, people who are new to it, or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff7010bb',
    type: 'Text',
    params: {
      header: 'Anything people should know?',
      placeholder: `Let members know if the activity will cost money, if they’ll need to bring materials with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb13bb',
    type: 'Text',
    params: {
      header: 'Finally, give your activity a title',
      placeholder: `Learn These Easy Techniques For Practicing Meditation`,
      maxLength: 70,
    },
  },
};

export const karaokeFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d5cc',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to karaoke?',
      dateLabel: 'Date and Time',
      datePlaceholder: 'Today, 9:00 p.m.',
      durationLabel: 'Duration',
      defaultDuration: duration(1, 30),
    },
  },
  eventWhere: {
    id: '28e86c72-9961-4d0f-9fd1-9479ba1486cc',
    type: 'Location',
    params: {
      header: 'Where do you want to karaoke?',
      nameLabel: 'Location Name',
      namePlaceholder: `Sing Sing Ave. A`,
      addressLabel: 'Location Address',
      addressPlaceholder: `81 Avenue A, New York`,
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb3cc',
    type: 'NumberRange',
    params: {
      header: 'How many people do you want to karaoke with?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint: `Unfortunately, if less than 4 people join your activity by the start time, it’ll have to be cancelled.`,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de0cc',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder: `Tell members why you’re excited about karaoke, what music you can’t wait to sing, and why joining will be a ton of fun. Remember to also include specific details about your itinerary so members know what to expect.`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f2420cc',
    type: 'Text',
    params: {
      header: `What type of singer is this for?`,
      placeholder: `Let members know who this activity is for, whether it’s karaoke veterans, someone who’s never sang into a mic before, or all the above.`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff7010cc',
    type: 'Text',
    params: {
      header: 'Is there anything singers need to bring or know about?',
      placeholder: `Let members who join know how much the karaoke reservation costs, if they need to bring anything with them, etc.`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb13cc',
    type: 'Text',
    params: {
      header: 'Finally, give your karaoke session a title',
      placeholder: `Grab A Mic And Sing Your Heart Out At Karaoke Night`,
      maxLength: 70,
    },
  },
};

const allFields = Object.assign(
  {},
  ...[
    exhibitFields,
    neighborhoodFields,
    movieFields,
    tvFields,
    amaFields,
    onlyOneFields,
    discussFields,
    debateFields,
    gamesFields,
    sportsFields,
    skillsFields,
    hobbyFields,
    karaokeFields,
  ].map(fields =>
    Object.assign({}, ...Object.values(fields).map(f => ({ [f.id]: f })))
  )
);

export const findField = id => new Promise(resolve => resolve(allFields[id]));
