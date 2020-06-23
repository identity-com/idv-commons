const R = require('ramda');

const {
  InvalidEventError
} = require('./Errors');
/**
 * An enum of event types.
 *
 * 'Process' refers to a validation process, triggered by a user requesting a credential.
 * UCA is a User Collectible Attribute, that is used to validate the user
 * @type {{UCA_STATUS_CHANGED: string, PROCESS_STATUS_CHANGED: string, PROCESS_UPDATED: string,
 * PROCESS_CREATED: string, UCA_RECEIVED: string}}
 */


const EventTypes = {
  // A new process has been created
  PROCESS_CREATED: 'Process Created',
  // The process status has been changed
  PROCESS_STATUS_CHANGED: 'Process Status Changed',
  // In a dynamic validation process plan, new UCA requests can be added ad-hoc to a running process
  PROCESS_UPDATED: 'Process Updated',
  // The user has responded with an answer to a UCA request
  UCA_RECEIVED: 'UCA Received',
  // A UCA status has been changed
  UCA_STATUS_CHANGED: 'UCA Status Changed',
  // A notification from an external task (either a completion event or a progress update)
  EXTERNAL_TASK_UPDATE: 'External Task Update',
  // An external service needs to be polled to check the status of the the external task
  EXTERNAL_TASK_POLL: 'External Task Poll'
};
const eventCreators = {}; // This throws an error if any of the expected fields in the
// event payload are undefined

const checkFieldsDefined = event => {
  const missingFields = Object.keys(event).filter(key => event[key] === undefined);

  if (missingFields.length) {
    throw new InvalidEventError(`Event is missing field(s) ${missingFields}. Event: ${JSON.stringify(event, null, 1)}`);
  }

  return event;
};

const addEventCreator = (type, payloadFn) => {
  const eventGeneratorFn = (...args) => {
    const payload = checkFieldsDefined(payloadFn(...args));
    return {
      type,
      payload
    };
  };

  eventCreators[type] = eventGeneratorFn;
};

addEventCreator(EventTypes.PROCESS_CREATED, ({
  id,
  credentialItemType
}) => ({
  id,
  credentialItemType
}));
addEventCreator(EventTypes.PROCESS_STATUS_CHANGED, ({
  id,
  oldStatus,
  newStatus
}) => ({
  id,
  oldStatus,
  newStatus
}));
addEventCreator(EventTypes.PROCESS_UPDATED, ({
  id,
  ucas
}) => ({
  id,
  ucas
}));
addEventCreator(EventTypes.UCA_RECEIVED, ({
  id,
  ucaId,
  value,
  applicantFirstName,
  applicantLastName
}) => ({
  id,
  ucaId,
  value,
  applicantFirstName: applicantFirstName || '',
  applicantLastName: applicantLastName || ''
}));
addEventCreator(EventTypes.UCA_STATUS_CHANGED, ({
  id,
  ucaId,
  oldStatus,
  newStatus
}) => ({
  id,
  ucaId,
  oldStatus,
  newStatus
})); // Task events can have taskId or taskName or both

const taskEventPayloadFn = event => {
  const {
    id,
    taskId,
    taskName,
    ...data
  } = event;

  if (!taskId && !taskName) {
    throw new InvalidEventError(`Event is missing field taskId or taskName. Event: ${JSON.stringify(event, null, 1)}`);
  }

  return R.mergeAll([{
    id,
    ...data
  }, taskId ? {
    taskId
  } : {}, taskName ? {
    taskName
  } : {}]);
};

addEventCreator(EventTypes.EXTERNAL_TASK_UPDATE, taskEventPayloadFn);
addEventCreator(EventTypes.EXTERNAL_TASK_POLL, taskEventPayloadFn);

const create = (type, options) => eventCreators[type](options);

module.exports = {
  EventTypes,
  create
};