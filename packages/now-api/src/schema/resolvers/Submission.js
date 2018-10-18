import escapeMarkdown from 'escape-markdown';
import { Duration } from 'js-joda';

import { findField } from './Fields';
import { findTemplate } from './Template';
import { isAdmin } from '../AdminDirective';
import { sqlPaginatify, userIdFromContext } from '../util';
import { Submissions } from '../../db/repos';
import { genRandomUuid } from '../../db/sql';
import { notifySubmission } from '../../jobs';
import { sha1 } from '../../util';

const submissionQuery = (root, { id }, context) =>
  Submissions.byId(id).then(
    submission =>
      submission.userId === userIdFromContext(context) || isAdmin(context)
        ? submission
        : null
  );

const allSubmissions = (root, { input, orderBy = 'createdAt' }) =>
  sqlPaginatify(orderBy, Submissions.all({}), input);

const manySubmissions = (root, { ids }, context) =>
  Promise.all(ids.map(id => submissionQuery(root, { id }, context)));

export const queries = {
  submission: submissionQuery,
  allSubmissions,
  manySubmissions,
};

const userResolver = ({ userId }, args, { loaders: { members } }) =>
  members.load(userId);

const templateResolver = ({ templateId }) => findTemplate(templateId);

const inputToValue = inputValue => {
  if ('intValue' in inputValue) {
    return { value: inputValue.intValue, t: 'IntFieldValue' };
  } else if ('stringValue' in inputValue) {
    return { value: inputValue.stringValue, t: 'StringFieldValue' };
  } else if ('dateTimeValue' in inputValue && 'durationValue' in inputValue) {
    return {
      value: inputValue.dateTimeValue,
      duration: inputValue.durationValue,
      t: 'DateTimeFieldValue',
    };
  } else if ('minValue' in inputValue && 'maxValue' in inputValue) {
    return {
      min: inputValue.minValue,
      max: inputValue.maxValue,
      t: 'RangeFieldValue',
    };
  } else if (
    'locationNameValue' in inputValue &&
    'locationAddressValue' in inputValue
  ) {
    return {
      name: inputValue.locationNameValue,
      address: inputValue.locationAddressValue,
      t: 'LocationFieldValue',
    };
  }
  return null;
};

const responsesResolver = ({ id: submissionId, submissionData }) =>
  submissionData.map(({ fieldId, ...inputValue }) => ({
    id: sha1(`${submissionId}.${fieldId}`),
    fieldId,
    value: inputToValue(inputValue),
  }));

const escape = (s: ?any) => (s ? escapeMarkdown(s.toString()) : '');

const formattedResponse = async ({ templateId, submissionData }) => {
  const template = await findTemplate(templateId);

  if (!template) {
    return null;
  }

  const findResponse = keyword => {
    const v = submissionData.find(
      response => response.fieldId === template[keyword].id
    );
    return v || {};
  };

  const eventWho = findResponse('eventWho');
  const eventWhat = findResponse('eventWhat');
  const eventWhere = findResponse('eventWhere');
  const eventWhen = findResponse('eventWhen');
  const eventHow = findResponse('eventHow');
  const eventSize = findResponse('eventSize');
  const eventTitle = findResponse('eventTitle');

  return `# ${escape(eventTitle.stringValue)}

## Details

at ${escape(eventWhere.locationNameValue)}${'  '}
${escape(eventWhere.locationAddressValue)}${'  '}
${escape(eventWhen.dateTimeValue)}${'  '}
${Duration.ofMillis(eventWhen.durationValue).toMinutes()} minutes long${'  '}
${escape(eventSize.minValue)}–${escape(eventSize.maxValue)} spots

## Description

### ${template.eventWho.params.header}

${escape(eventWho.stringValue)}

### ${template.eventWhat.params.header}

${escape(eventWhat.stringValue)}

### ${template.eventHow.params.header}

${escape(eventHow.stringValue)}
`;
};

export const resolvers = {
  user: userResolver,
  template: templateResolver,
  responses: responsesResolver,
  formattedResponse,
};

export const responseResolvers = {
  field: ({ fieldId }) => findField(fieldId),
};

export const fieldValueResolvers = {
  __resolveType: ({ t }) => t,
};

const submitTemplate = async (
  root,
  { input: { templateId, responses } },
  context
) => {
  await findTemplate(templateId); // throws if invalid template id provided

  // TODO: validate, like, anything at all?
  const [id] = await Submissions.insert({
    id: genRandomUuid(),
    templateId,
    userId: userIdFromContext(context),
    submissionData: JSON.stringify(responses), // node-postgres does the wrong thing with JSON arrays unless we stringify first
  }).returning('id');

  // TODO: figure out how to compute the body inside the job so we don't have to do it now
  const body = await formattedResponse({
    templateId,
    submissionData: responses,
  });
  await notifySubmission(id, body, context.user);

  return { submission: submissionQuery({}, { id }, context) };
};

export const mutations = { submitTemplate };
