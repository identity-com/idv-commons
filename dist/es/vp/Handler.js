/* eslint-disable class-methods-use-this, max-classes-per-file, no-unused-vars, no-console */
const R = require('ramda');

const {
  definitions,
  UserCollectableAttribute
} = require('@identity.com/uca');

const {
  errors: {
    idvErrors: {
      IDVErrorCodes
    }
  }
} = require('@identity.com/credential-commons');

const {
  ValidationProcessStatus,
  EventTypes,
  UCAStatus,
  ClientHints
} = require('../constants/ValidationConstants'); // TODO temp CIV-806


const contextAwareLogger = () => console;

const log = {
  silly: (...args) => console.debug(...args),
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

const {
  MissingUCAError,
  UCAUpdateError,
  UCAVersionError,
  UCAValueError
} = require('./Errors');
/**
 * Defines some helper classes for defining handlers. Handlers are defined as a function:
 * (state, event) -> state  (or (state, event) -> Promise(state))
 *
 * Each of these handler classes can be used as a handler function by calling their
 * toFunction() method. The event engine does this automatically when they are registered.
 */


const validIdentifiers = definitions.map(d => d.identifier);
/**
 * Abstract handler class - separates the two common steps in a handler function:
 * 1 - check if the handler applies for this event
 * 2 - alter the state based on the event.
 *
 * This class is designed to be subclassed and not used directly. When used directly
 * it is a noop.
 */

class Handler {
  /**
   * Return true if this handler is supposed to handle this event
   * @param event The event to evaluate
   * @param state The process state
   * @return {boolean} whether the handler should apply to the event
   */
  // eslint-disable-next-line no-unused-vars
  canHandle(event, state) {
    return true;
  }
  /**
   * Manipulate the state based on the event. Must return the resultant state
   * @param state The incoming state
   * @param event The incoming event
   * @return {*} The outcoming state
   */
  // eslint-disable-next-line no-unused-vars


  handle(state, event) {
    return state;
  }

  toString() {
    return `Handler Name: ${this.constructor.name}]`;
  }
  /**
   * Convert the handler into a pure function of the form (state, event) -> state
   * @return {*} A pure-function version of the handler object
   */


  toFunction() {
    return (state, event) => {
      if (this.canHandle(event, state)) {
        return this.handle(state, event);
      }

      return state;
    };
  }

}
/**
 * Helper class that encapsulates the most common check that handlers need to do,
 * namely check whether the handler is supposed to be applied to this event
 */


class TypeHandler extends Handler {
  /**
   * Construct the handler with the event type it is supposed to pay attention to
   * @param type The event type
   */
  constructor(type) {
    super();
    this.type = type;
  }
  /**
   * Checks if the event matches the type
   * @param event The incoming event
   * @return {boolean} True if the event is of the correct type
   */


  canHandle(event, state) {
    return event.type === this.type;
  }

  toString() {
    return `TypeHandler[${this.type}] Name: ${this.constructor.name}]`;
  }

}
/**
 * Throws an error if a uca cannot receive a value for some reason
 * @param uca The UCA being updated
 * @param processState The overall process state
 */


function checkUCAIsUpdateable(uca, processState) {
  log.silly(`Evaluating if UCA: ${JSON.stringify(uca)} is receivable`);

  if (!uca.status) {
    throw new UCAUpdateError('Unable to determine if the UCA can be updated as it has no status', IDVErrorCodes.ERROR_IDV_UCA_UPDATE_NO_STATUS, uca.name);
  }

  if (!processState.status) {
    throw new UCAUpdateError('Unable to determine if the UCA can be updated, because the process it belongs to has no status', IDVErrorCodes.ERROR_IDV_UCA_UPDATE_NO_PROCESS_STATUS, uca.name);
  }

  if (processState.status === ValidationProcessStatus.FAILED || processState.status === ValidationProcessStatus.CANCELED) {
    throw new UCAUpdateError(`Cannot update a UCA on a process in status ${processState.status}`, IDVErrorCodes.ERROR_IDV_PROCESS_HAS_FINAL_STATUS, uca.name);
  }

  if ([UCAStatus.AWAITING_DEPENDENCY, UCAStatus.ACCEPTED, UCAStatus.TEMPLATE].includes(uca.status)) {
    throw new UCAUpdateError(`Cannot update a UCA in status ${uca.status}`, IDVErrorCodes.ERROR_IDV_UCA_HAS_FINAL_STATUS, uca.name);
  }

  if (uca.retriesRemaining <= 0) {
    throw new UCAUpdateError('UCA has no more retries remaining.', IDVErrorCodes.ERROR_IDV_UCA_NO_RETRIES, uca.name);
  }
}
/**
 * A helper handler that abstracts a lot of the work around receiving UCA values.
 *
 * This handler will automatically add the incoming value to the state, and then
 * delegate to the handleUCA function to perform any checks on the value.
 *
 * After handling is complete, the state is returned, so handleUCA does not need to
 * do anything if not required.
 */


class UCAHandler extends TypeHandler {
  /**
   * Constructs the handler to only listen to UCA_RECEIVED events
   * @param ucaName Name of the UCA to handle. When omitted, handle all UCAs
   * @param autoAccept When true, marks UCAs as accepted automatically
   */
  constructor(ucaName = null, autoAccept = false, ucaVersion = '1') {
    super(EventTypes.UCA_RECEIVED);
    this.ucaName = ucaName;
    this.autoAccept = autoAccept;
    this.ucaVersion = ucaVersion;
  }

  canHandle(event, state) {
    // if the type is not right, reject the event
    if (!super.canHandle(event, state)) return false;
    const {
      ucaId
    } = event.payload; // throw an error if there are no UCAs in the process or if the UCA
    // specified in the event is missing

    if (!state.ucas || !state.ucas[ucaId]) {
      throw new MissingUCAError(event.payload.id, ucaId);
    } // if no ucaName is specified, accept the event


    if (!this.ucaName) return true; // find the ids any UCAs in the state that have the name = this.ucaName

    const ucaIdsWithName = Object.keys(state.ucas).filter(aUCAId => state.ucas[aUCAId].name === this.ucaName); // return true if the event is for one of the UCAs that has the right name

    return ucaIdsWithName.includes(ucaId);
  }
  /**
   * Handle the incoming UCA_RECEIVED event by setting its value to the state.
   * Will throw a MissingUCAError if the UCA ID is not found in the process.
   *
   * UCAHandler is an asynchronous handler, which means that its handle function
   * returns a promise of the resultant state.
   *
   * @param state The incoming process state
   * @param event The incoming UCA_RECEIVED event
   * @return {{ucas}|*} the resultant state
   */


  async handle(state, event) {
    const logger = contextAwareLogger(state, log);
    const {
      ucaId,
      value
    } = event.payload;
    const ucaState = state.ucas[ucaId]; // throw an error if the UCA is not updateable

    checkUCAIsUpdateable(ucaState, state); // throw an error if the UCA value does not have the correct format or version

    this.validate(value, ucaId, state.ucaVersion); // validation has all passed

    ucaState.value = value;

    if (this.autoAccept) {
      ucaState.status = UCAStatus.ACCEPTED;
    } // If a UCA can only be updated a fixed number of times,
    // decrement the number of retries remaining


    if (ucaState.retriesRemaining) {
      ucaState.retriesRemaining -= 1;
    }

    logger.debug(`Handling UCA: ${JSON.stringify(ucaState)}`);
    await this.handleUCA(value, ucaState, state);
    return state;
  }

  validate(value, ucaId, ucaVersion = '1') {
    // check if the ucaId is in the UCA definitions, if it is, check that the value is valid,
    // otherwise allow the value
    if (ucaVersion !== this.ucaVersion) {
      throw new UCAVersionError(`Handler ucaVersion '${this.ucaVersion}' doesn't equal state ucaVersion '${ucaVersion}'`, IDVErrorCodes.ERROR_IDV_UCA_WRONG_VERSION, this.ucaVersion, ucaVersion);
    } else if (this.ucaName && R.includes(this.ucaName, validIdentifiers)) {
      // instantiate a UCA to check the value
      try {
        const ucaObject = new UserCollectableAttribute(this.ucaName, value, this.ucaVersion);
      } catch (error) {
        throw new UCAValueError(`UCA value '${JSON.stringify(value)}' isn't good for UCA Identifier '${ucaId}' error = ${error}`, IDVErrorCodes.ERROR_IDV_UCA_BAD_VALUE, this.ucaName, value, error);
      }
    }
  }
  /**
   * Perform further processing on the incoming value. This is a noop by default.
   * Any return value from this function is ignored
   * @param value The UCA value received from the client
   * @param ucaState The state in which this value is already stored
   * @param processState The overall state of the process. Use this to refer to any other
   * UCA values or other process state.
   */
  // eslint-disable-next-line no-unused-vars


  async handleUCA(value, ucaState, processState) {// NOOP
  }

  toString() {
    return `UCAHandler[${this.ucaName}]`;
  }

} // Marks a UCA as validating


class ValidatingHandler extends UCAHandler {
  constructor(ucaName, ucaVersion) {
    super(ucaName, false, ucaVersion);
  }

  canHandle(event, state) {
    if (!super.canHandle(event, state)) return false;
    const {
      ucaId
    } = event.payload;
    const ucaState = state.ucas[ucaId]; // Do not run the validating handler if the UCA has the clientHints parameters with prefill

    return !(R.path(['parameters', 'clientHints'], ucaState) || []).includes(ClientHints.PREFILL);
  }

  async handleUCA(value, ucaState) {
    // eslint-disable-next-line no-param-reassign
    ucaState.errors = []; // eslint-disable-next-line no-param-reassign

    ucaState.status = UCAStatus.VALIDATING;
  }

}

module.exports = {
  Handler,
  TypeHandler,
  UCAHandler,
  ValidatingHandler
};