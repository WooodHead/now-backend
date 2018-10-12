// @flow
/* eslint-disable import/prefer-default-export */
import { withHashId } from '../../util';

type HostGuidelinesBullet = {
  id: string,
  imageName: string,
  title: string,
  description: string,
};

type HostGuidelines = {
  title: string,
  description: string,
  imageName: string,
  howToHeading: string,
  bullets: Array<HostGuidelinesBullet>,
  conclusion: string,
  buttonText: string,
};

// eslint-disable-next-line no-undef
const bullets: Array<HostGuidelinesBullet> = [
  {
    imageName: 'bullet-calendar',
    title: 'Be accountable',
    description:
      'Commit to the dates, times, and locations you schedule your activities for. No last minute surprises, please!',
  },
  {
    imageName: 'bullet-ribbon',
    title: 'Be welcoming',
    description: `Start with introductions and allow yourself to be vulnerable and sincere. That's how the best connections are made.`,
  },
  {
    imageName: 'bullet-crowd',
    title: 'Be inclusive',
    description:
      'Never exclude guests based on identity, meaning gender, race, religion, or sexuality among others.',
  },
  {
    imageName: 'bullet-stars',
    title: 'Be prepared',
    description:
      'Make sure you have the necessary materials. Hint: You need a ball to play basketball.',
  },
  {
    imageName: 'bullet-smartphone',
    title: 'Be the solution',
    description:
      'Host in-real-life activities that challenge our screen-obsessed routines. No video calls, obviously.',
  },
].map(withHashId);

const guidelines: HostGuidelines = {
  title: `You're seconds away from hosting your first activity!`,
  description: [
    'Do you want to see a movie, discuss the news, play a board game, or all of the above and more?',
    `Get started by reviewing the guidelines below and you'll be on your way towards hosting an activity you're excited about in no time.`,
  ].join('\n\n'),
  imageName: 'group-selfie',
  howToHeading: 'How can I host awesome activities?',
  bullets,
  conclusion: 'Alright, are you ready?',
  buttonText: 'Get started',
};

export const queries = { hostGuidelines: () => guidelines };
