'use strict';

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
  CANCELED: 'CANCELED'
};

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
  TEMPLATE: 'TEMPLATE'
};

module.exports = { ValidationProcessStatus, UCAStatus };