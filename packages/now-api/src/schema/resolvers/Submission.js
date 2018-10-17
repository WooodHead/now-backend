import { findField } from './Fields';
import { findTemplate } from './Template';
import { isAdmin } from '../AdminDirective';
import { Submissions } from '../../db/repos';
import { genRandomUuid } from '../../db/sql';
import { userIdFromContext } from '../util';

const submissionQuery = (root, { id }, context) =>
  Submissions.byId(id).then(
    submission =>
      submission.userId === userIdFromContext(context) || isAdmin(context)
        ? submission
        : null
  );

export const queries = { submission: submissionQuery };

const userResolver = ({ userId }, args, { loaders: { members } }) =>
  members.load(userId);

const templateResolver = ({ templateId }) => findTemplate(templateId);

const responsesResolver = ({ submissionData }) =>
  submissionData.map(({ fieldId, ...inputValue }) => {
    let value = null;
    if ('intValue' in inputValue) {
      value = { value: inputValue.intValue, t: 'IntFieldValue' };
    } else if ('stringValue' in inputValue) {
      value = { value: inputValue.stringValue, t: 'StringFieldValue' };
    } else if ('dateTimeValue' in inputValue && 'durationValue' in inputValue) {
      value = {
        value: inputValue.dateTimeValue,
        duration: inputValue.durationValue,
        t: 'DateTimeFieldValue',
      };
    }
    return { fieldId, value };
  });

export const resolvers = {
  user: userResolver,
  template: templateResolver,
  responses: responsesResolver,
};

export const responseResolvers = {
  field: ({ fieldId }) => findField(fieldId),
};

export const fieldValueResolvers = {
  __resolveType: ({ t }) => t,
};

const submitTemplate = (root, { input: { templateId, responses } }, context) =>
  // TODO: validate, like, anything at all?
  findTemplate(templateId)
    .then(() =>
      Submissions.insert({
        id: genRandomUuid(),
        templateId,
        userId: userIdFromContext(context),
        submissionData: JSON.stringify(responses), // node-postgres does the wrong thing with JSON arrays unless we stringify first
      }).returning('id')
    )
    .then(([id]) => ({ submission: submissionQuery({}, { id }, context) }));

export const mutations = { submitTemplate };
