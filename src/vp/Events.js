const R = require('ramda');

const { InvalidEventError } = require('./InternalErrors');
const { EventTypes } = require('../constants/ValidationConstants');

const eventCreators = {};

// This throws an error if any of the expected fields in the
// event payload are undefined
const checkFieldsDefined = (event) => {
  const missingFields = Object.keys(event).filter((key) => event[key] === undefined);

  if (missingFields.length) {
    throw new InvalidEventError(`Event is missing field(s) ${missingFields}. Event: ${JSON.stringify(event, null, 1)}`);
  }

  return event;
};

const getContext = ({ context }) => context || {};

const addEventCreator = (type, payloadFn) => {
  const eventGeneratorFn = (...args) => {
    const payload = checkFieldsDefined(payloadFn(...args));
    const context = getContext(...args);
    return {
      type,
      payload,
      context,
    };
  };

  eventCreators[type] = eventGeneratorFn;
};

addEventCreator(EventTypes.PROCESS_CREATED, ({ id, credentialItemType }) => ({ id, credentialItemType }));
addEventCreator(EventTypes.PROCESS_STATUS_CHANGED, ({ id, oldStatus, newStatus }) => ({ id, oldStatus, newStatus }));
addEventCreator(EventTypes.PROCESS_UPDATED, ({ id, ucas }) => ({ id, ucas }));

addEventCreator(EventTypes.UCA_RECEIVED, ({
  id, ucaId, value, applicantFirstName, applicantLastName,
}) => ({
  id,
  ucaId,
  value,
  applicantFirstName: applicantFirstName || '',
  applicantLastName: applicantLastName || '',
}));
addEventCreator(EventTypes.UCA_STATUS_CHANGED, ({
  id, ucaId, oldStatus, newStatus,
}) => ({
  id,
  ucaId,
  oldStatus,
  newStatus,
}));

// Task events can have taskId or taskName or both
const taskEventPayloadFn = (event) => {
  const {
    id, taskId, taskName, ...data
  } = event;
  if (!taskId && !taskName) {
    throw new InvalidEventError(`Event is missing field taskId or taskName. Event: ${JSON.stringify(event, null, 1)}`);
  }

  return R.mergeAll([{ id, ...data }, taskId ? { taskId } : {}, taskName ? { taskName } : {}]);
};

addEventCreator(EventTypes.EXTERNAL_TASK_UPDATE, taskEventPayloadFn);
addEventCreator(EventTypes.EXTERNAL_TASK_POLL, taskEventPayloadFn);

const create = (type, options) => eventCreators[type](options);

module.exports = {
  create,
};
