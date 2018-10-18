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
      header: 'When is your visit?',
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
      header: 'Where is the museum?',
      nameLabel: 'Location Name',
      namePlaceholder: 'Metropolitan Museum of Art',
      addressLabel: 'Location Address',
      addressPlaceholder: '1000 5th Ave, New York',
    },
  },
  eventSize: {
    id: '7071f2d9-85e8-430f-9f10-f94614cfb311',
    type: 'NumberRange',
    params: {
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Let’s go to the museum to see... `,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242011',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Everyone who’s interested...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701011',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Tickets are free with a NY state ID...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1311',
    type: 'Text',
    params: {
      header: 'Give your visit a title',
      placeholder: `Let’s explore the Met Museum exhibits`,
      maxLength: 70,
    },
  },
};

export const neighborhoodFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d522',
    type: 'DateTimeDuration',
    params: {
      header: 'When is a good time?',
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
      header: 'Where will you start?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Let’s eat our way through Flushing...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242022',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `People interested in food and culture...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701022',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Make sure to bring cash just in case...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1322',
    type: 'Text',
    params: {
      header: 'Name your exploration',
      placeholder: `Explore Flushing by dumpling tour`,
      maxLength: 70,
    },
  },
};

export const movieFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d533',
    type: 'DateTimeDuration',
    params: {
      header: 'When is the movie?',
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
      header: 'Which theater is it at?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Let’s meet outside the theater before...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242033',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Anyone who’s excited about the movie...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701033',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Let’s buy our tickets together online...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1333',
    type: 'Text',
    params: {
      header: 'Name your movie hangout',
      placeholder: `Let’s see Crazy Rich Asians in theater`,
      maxLength: 70,
    },
  },
};

export const tvFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d544',
    type: 'DateTimeDuration',
    params: {
      header: 'When would you like to watch?',
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
      header: 'Where would you like to watch?',
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
      header: 'Spots available?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
    },
  },
  eventWhat: {
    id: '3aaf4489-9ce1-409d-b656-a576ff4de044',
    type: 'Text',
    params: {
      header: `What will you do?`,
      placeholder: `Let’s watch the season premiere of...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242044',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `Everyone, die-hard fans and newbies...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701044',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Drinks will be provided, but bring...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1344',
    type: 'Text',
    params: {
      header: 'Name your viewing party',
      placeholder: `Watch the Game of Thrones premiere`,
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
      header: 'Where will it be?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Come ask me specific questions about...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242055',
    type: 'Text',
    params: {
      header: `Who's this AMA for?`,
      placeholder: `Genuinely curious people only, no trolls...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701055',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Building security will need to see an ID...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1355',
    type: 'Text',
    params: {
      header: 'Give your AMA a title',
      placeholder: `AMA about being an immigrant`,
      maxLength: 70,
    },
  },
};

export const onlyOneFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d566',
    type: 'DateTimeDuration',
    params: {
      header: `When's your discussion?`,
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
      header: 'Where will it be?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Let’s exchange thoughts and experiences...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242066',
    type: 'Text',
    params: {
      header: `Who's this discussion for?`,
      placeholder: `Anyone who feels or has felt similarly...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701066',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Drinks will be provided, but bring snacks...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1366',
    type: 'Text',
    params: {
      header: 'Name your discussion',
      placeholder: `Am I the only one who love & hates NYC`,
      maxLength: 70,
    },
  },
};

export const discussFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d577',
    type: 'DateTimeDuration',
    params: {
      header: `When’s your discussion?`,
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
      header: 'Where will it be?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Let’s share tips on how to travel for less...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242077',
    type: 'Text',
    params: {
      header: `Who's this discussion for?`,
      placeholder: `Anyone who’s interested in Europe trips...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701077',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Come with travel questions in mind...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1377',
    type: 'Text',
    params: {
      header: 'Name your discussion',
      placeholder: `Let's discuss Europe travel tips`,
      maxLength: 70,
    },
  },
};

export const debateFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d588',
    type: 'DateTimeDuration',
    params: {
      header: `When’s your discussion?`,
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
      header: 'Where will it be?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `Come share your stance on whether...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242088',
    type: 'Text',
    params: {
      header: `Who's this discussion for?`,
      placeholder: `Only people who are capable of friendly...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701088',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `You’ll need an ID to get into the building...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1388',
    type: 'Text',
    params: {
      header: 'Name your debate',
      placeholder: `Should brands take a stance on politics`,
      maxLength: 70,
    },
  },
};

export const gamesFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d599',
    type: 'DateTimeDuration',
    params: {
      header: 'When can you play?',
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
      header: 'Where would you like to play?',
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
      header: `What will you do?`,
      placeholder: `Come hangout and play board games...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242099',
    type: 'Text',
    params: {
      header: `Who can play?`,
      placeholder: `Everyone, experienced players and new...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701099',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `The game will be provided, but bring...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1399',
    type: 'Text',
    params: {
      header: 'Give your hangout a title',
      placeholder: `Play the Settlers Of Catan board game`,
      maxLength: 70,
    },
  },
};

export const sportsFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d500',
    type: 'DateTimeDuration',
    params: {
      header: 'When can you play?',
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
      header: 'Where would you like to play?',
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
      header: `What will you do?`,
      placeholder: `Let’s play pickup soccer in Central Park...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f242000',
    type: 'Text',
    params: {
      header: `Who can play?`,
      placeholder: `All skill levels are invited…`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff701000',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `A ball will be provided, but bring water...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb1300',
    type: 'Text',
    params: {
      header: 'Name your pickup game',
      placeholder: `Come play pickup soccer in Central Park`,
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `I’ll teach you to hem your clothes through...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f2420aa',
    type: 'Text',
    params: {
      header: `Who can join?`,
      placeholder: `Anyone excited to learn how to hem...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff7010aa',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `Bring your own clothing to hem...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb13aa',
    type: 'Text',
    params: {
      header: 'Give your activity a title',
      placeholder: `Learn how to hem your own clothing`,
      maxLength: 70,
    },
  },
};

export const hobbyFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d5bb',
    type: 'DateTimeDuration',
    params: {
      header: 'When do you want to share?',
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
      header: 'Where will you share?',
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
      header: 'Spots available?',
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
      header: `What will you do?`,
      placeholder: `I’ll walk you through simple meditation...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f2420bb',
    type: 'Text',
    params: {
      header: `Who can join?`,
      placeholder: `Anyone who’s genuinely interested in...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff7010bb',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `All you need to bring is an open mind...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb13bb',
    type: 'Text',
    params: {
      header: 'Finally, give your activity a title',
      placeholder: `Learn a few easy meditation techniques`,
      maxLength: 70,
    },
  },
};

export const karaokeFields = {
  eventWhen: {
    id: '42388918-defc-4364-b9dd-79f41019d5cc',
    type: 'DateTimeDuration',
    params: {
      header: 'When can you karaoke?',
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
      header: 'Where will you host it?',
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
      header: `What will you do?`,
      placeholder: `Come grab a mic and sing your favorite...`,
      maxLength: 500,
    },
  },
  eventWho: {
    id: '3df93f43-306d-44b5-9a39-d2d92f2420cc',
    type: 'Text',
    params: {
      header: `Who's this for?`,
      placeholder: `All karaoke veterans and newbies who...`,
      maxLength: 300,
    },
  },
  eventHow: {
    id: 'd6675c14-752d-4692-bcde-3894ff7010cc',
    type: 'Text',
    params: {
      header: 'What should they know?',
      placeholder: `The reservation will probably cost $8...`,
      maxLength: 200,
    },
  },
  eventTitle: {
    id: 'b5c15ff6-8e5e-4652-a3ac-8ca108fb13cc',
    type: 'Text',
    params: {
      header: 'Name your karaoke party',
      placeholder: `Sing your heart out at karaoke night`,
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
