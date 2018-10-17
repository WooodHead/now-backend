import gql from 'graphql-tag';
import { ZonedDateTime } from 'js-joda';

import { client, USER_ID } from '../db/mock';
import sql from '../db/sql';
import { SQL_TABLES } from '../db/constants';
import factory from '../db/factory';

const truncateTables = () =>
  Promise.all([
    sql(SQL_TABLES.SUBMISSIONS).truncate(),
    sql(SQL_TABLES.USERS).truncate(),
  ]);

const user = factory.build('user', { id: USER_ID });

beforeEach(() =>
  truncateTables().then(() => sql(SQL_TABLES.USERS).insert(user)));

afterEach(() => truncateTables());

const submit = gql`
  mutation submit($when: ZonedDateTime!) {
    submitTemplate(
      input: {
        templateId: "ebf997e5-cf24-407f-b98d-5108d73b4044"
        responses: [
          {
            fieldId: "42388918-defc-4364-b9dd-79f41019d511"
            dateTimeValue: $when
            durationValue: 6300000
          }
          {
            fieldId: "28e86c72-9961-4d0f-9fd1-9479ba148611"
            stringValue: "the museum"
          }
          { fieldId: "7071f2d9-85e8-430f-9f10-f94614cfb311", intValue: 8 }
          {
            fieldId: "3aaf4489-9ce1-409d-b656-a576ff4de011"
            stringValue: "we'll do some stuff"
          }
          {
            fieldId: "3df93f43-306d-44b5-9a39-d2d92f242011"
            stringValue: "it's for my mates"
          }
          {
            fieldId: "d6675c14-752d-4692-bcde-3894ff701011"
            stringValue: "knowledge is power"
          }
          {
            fieldId: "b5c15ff6-8e5e-4652-a3ac-8ca108fb1311"
            stringValue: "my awesome title"
          }
        ]
      }
    ) {
      submission {
        id
      }
    }
  }
`;

const query = gql`
  query submission($id: ID!) {
    submission(id: $id) {
      id
      template {
        id
        title
      }
      user {
        id
        firstName
        bio
      }
      createdAt
      updatedAt
      responses {
        field {
          id
          type
        }
        value {
          __typename
          ... on StringFieldValue {
            s: value
          }
          ... on IntFieldValue {
            i: value
          }
          ... on DateTimeFieldValue {
            dt: value
            duration
          }
        }
      }
    }
  }
`;

describe('submission', () => {
  it('can post a submission and then retrieve it', async () => {
    const when = ZonedDateTime.now()
      .plusDays(4)
      .withFixedOffsetZone();

    const {
      data: {
        submitTemplate: {
          submission: { id },
        },
      },
    } = await client.mutate({
      mutation: submit,
      variables: { when: when.toString() },
    });

    const {
      data: { submission },
    } = await client.query({
      query,
      variables: { id },
    });

    expect(submission).toMatchObject({
      id: expect.stringMatching(/^[a-f0-9-]+$/),
      template: {
        id: 'ebf997e5-cf24-407f-b98d-5108d73b4044',
        title: 'Visit A Museum Exhibit',
      },
      user: {
        id: USER_ID,
        firstName: user.firstName,
        bio: user.bio,
      },
    });

    const { responses } = submission;
    expect(responses).toHaveLength(7);
    responses.forEach(response => {
      expect(response).toHaveProperty(
        'field.type',
        expect.stringMatching(/^Text|NumberRange|Location|DateTimeDuration$/)
      );
      // eslint-disable-next-line no-underscore-dangle
      switch (response.value.__typename) {
        case 'DateTimeFieldValue':
          expect(response.value.dt).toMatch(
            /^20[0-9]{2}-[0-9]{2}-[0-9]{2}T.*$/
          );
          expect(response.value.duration).toBe(6300000);
          break;

        case 'StringFieldValue':
          expect(response.value.s).toEqual(expect.any(String));
          break;

        case 'IntFieldValue':
          expect(response.value.i).toEqual(expect.any(Number));
          break;

        default:
          expect(true).toBe(false); // shouldn't happen!
      }
    });
  });
});
