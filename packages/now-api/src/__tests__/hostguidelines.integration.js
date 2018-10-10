import gql from 'graphql-tag';

import { client } from '../db/mock';

const query = gql`
  {
    hostGuidelines {
      title
      description
      imageName
      howToHeading
      bullets {
        id
        imageName
        title
        description
      }
      conclusion
      buttonText
    }
  }
`;

describe('host guidelines', () => {
  it('should return results', async () => {
    const {
      data: { hostGuidelines },
    } = await client.query({ query });

    const { bullets } = hostGuidelines;

    expect(bullets).toHaveLength(5);
    bullets.forEach(bullet =>
      expect(bullet).toMatchObject({
        id: expect.stringMatching(/^[a-f0-9]{40}$/),
        description: expect.any(String),
        imageName: expect.stringMatching(
          /^(bullet-calendar|bullet-ribbon|bullet-crowd|bullet-stars|bullet-smartphone)$/
        ),
        title: expect.any(String),
      })
    );
  });
});
