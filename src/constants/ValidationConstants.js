/**
 * Enum for ValidationProcessStatus
 * @readonly
 * @enum { string } IN_PROGRESS | COMPLETE | FAILED | CANCELED
 * @type {{IN_PROGRESS: string, COMPLETE: string, FAILED: string, CANCELED: string, DELETED: string}}
 */
const ValidationProcessStatus = {
  // The process has been created and has not yet finished
  IN_PROGRESS: 'IN_PROGRESS',
  // The process has been completed successfully, a credential can be issued
  COMPLETE: 'COMPLETE',
  // The process could not be completed, either because the user gave invalid or incomplete
  // answers to UCA requests, or some external service indicated that the user cannot be validated
  // A failed process typically implies that restarting the same process will also fail.
  FAILED: 'FAILED',
  // The user or some service has stopped the process early.
  // A canceled process can, in principle, be restarted.
  // It does not imply that the user's data was not valid
  CANCELED: 'CANCELED',
  // The process was deleted
  DELETED: 'DELETED',
};

/**
 * Enum for UCAStatus
 * @readonly
 * @enum { string } AWAITING_USER_INPUT | AWAITING_DEPENDENCY | ACCEPTED | INVALID | VALIDATING | TEMPLATE
 */
const UCAStatus = {
  // The UCA is waiting to be collected from the user
  AWAITING_USER_INPUT: 'AWAITING_USER_INPUT',
  // The UCA cannot be collected until its dependencies are resolved
  AWAITING_DEPENDENCY: 'AWAITING_DEPENDENCY',
  // The UCA from the user was deemed to be valid
  ACCEPTED: 'ACCEPTED',
  // The UCA from the user was deemed to be invalid
  INVALID: 'INVALID',
  // The UCA is being validated, either in the background, or is waiting on other UCAs before it can be validated.
  VALIDATING: 'VALIDATING',
  // The UCA is a template, that itself does not need to be filled with a value, but may create a concrete
  // UCA of the same type in the process in the future.
  TEMPLATE: 'TEMPLATE',
};

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
  EXTERNAL_TASK_POLL: 'External Task Poll',
};

const ClientHints = {
  PREFILL: 'prefill',
};

module.exports = {
  ValidationProcessStatus, UCAStatus, EventTypes, ClientHints,
};
