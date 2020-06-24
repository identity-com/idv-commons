"use strict";

/* eslint-disable max-classes-per-file */
const {
  errors: {
    idvErrors: {
      ErrorContextTypes,
      IDVErrorCodes
    }
  }
} = require('@identity.com/credential-commons');
/**
 * These error codes are not part of the Identity.com specification, but are used internally
 * in the IDV Toolkit only
 */


const InternalErrorCode = {
  ERROR_IDV_MISSING_UCA: 'error.idv.missing.event'
};
const InternalErrorContextTypes = {
  EVENT_INDEX: 'event_index'
};
/*
 * These errors can define an extra 'data' return that contains
 * the data that can be sent back to the client via a Feathers IDV error
 */

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }

}

class InvalidEventError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidEventError';
  }

}

class InvalidJobError extends Error {
  constructor(type) {
    super(`Unrecognised job type ${type}`);
    this.name = 'InvalidJobError';
  }

}

class MissingEntityError extends Error {}

class MissingProcessError extends MissingEntityError {
  constructor(id) {
    super(`Could not find process with ID ${id}`);
    this.processId = id;
    this.name = 'MissingProcessError';
    this.errorCode = IDVErrorCodes.ERROR_IDV_MISSING_PROCESS;
  }

  get data() {
    return [{
      name: ErrorContextTypes.PROCESS_ID,
      value: this.processId
    }];
  }

}

class MissingUCAError extends MissingEntityError {
  constructor(processId, ucaId) {
    super(`Could not find UCA with ID ${ucaId} in process ${processId}`);
    this.processId = processId;
    this.ucaId = ucaId;
    this.name = 'MissingUCAError';
    this.errorCode = IDVErrorCodes.ERROR_IDV_MISSING_UCA;
  }

  get data() {
    return [{
      name: ErrorContextTypes.UCA_ID,
      value: this.ucaId
    }, {
      name: ErrorContextTypes.PROCESS_ID,
      value: this.processId
    }];
  }

}

class MissingEventError extends MissingEntityError {
  constructor(processId, eventIndex) {
    super(`Could not find event with index ${eventIndex} in process ${processId}`);
    this.processId = processId;
    this.eventIndex = eventIndex;
    this.name = 'MissingEventError';
    this.errorCode = InternalErrorCode.ERROR_IDV_MISSING_UCA;
  }

  get data() {
    return [{
      name: InternalErrorContextTypes.EVENT_INDEX,
      value: this.eventIndex
    }, {
      name: ErrorContextTypes.PROCESS_ID,
      value: this.processId
    }];
  }

}

class MissingPlanError extends MissingEntityError {
  constructor(credentialItem) {
    super(`Could not find a valdation plan for credential item ${credentialItem}`);
    this.credentialItem = credentialItem;
    this.name = 'MissingPlanError';
    this.errorCode = IDVErrorCodes.ERROR_IDV_MISSING_PLAN;
  }

  get data() {
    return [{
      name: ErrorContextTypes.CREDENTIAL_ITEM,
      value: this.credentialItem
    }];
  }

}

class InvalidProcessStateError extends Error {
  constructor(message, id) {
    super(message);
    this.name = 'InvalidProcessStateError';
    this.ucaId = id;
    this.errorCode = IDVErrorCodes.ERROR_IDV_UCA_SERVER;
  }

  get data() {
    return [{
      name: ErrorContextTypes.UCA_ID,
      value: this.ucaId
    }];
  }

}

class ProcessIdMismatchError extends Error {
  constructor(message, id) {
    super(message);
    this.processId = id;
    this.name = 'ProcessIdMismatchError';
    this.errorCode = IDVErrorCodes.ERROR_IDV_UCA_SERVER;
  }

  get data() {
    return [{
      name: ErrorContextTypes.PROCESS_ID,
      value: this.processId
    }];
  }

}

class InvalidUCAValueError extends Error {
  constructor(message, errorCode, value, ucaState) {
    super(message);
    this.name = 'InvalidUCAValueError';
    this.errorCode = errorCode;
    this.ucaValue = value;
    this.ucaState = ucaState;
  }

  get data() {
    return [{
      name: ErrorContextTypes.UCA_VALUE,
      value: this.ucaValue
    }, {
      name: ErrorContextTypes.UCA_STATE,
      value: this.ucaState
    }];
  }

}

class UCAUpdateError extends Error {
  constructor(message, errorCode, ucaName) {
    super(message);
    this.name = 'UCAUpdateError';
    this.errorCode = errorCode;
    this.ucaName = ucaName;
  }

  get data() {
    return [{
      name: ErrorContextTypes.UCA_NAME,
      value: this.ucaName
    }];
  }

}

class UCAValueError extends UCAUpdateError {
  constructor(message, errorCode, ucaName, ucaValue, ucaError) {
    super(message, errorCode, ucaName);
    this.name = 'UCAValueError';
    this.ucaValue = ucaValue;
    this.ucaError = String(ucaError);
  }

  get data() {
    return [{
      name: ErrorContextTypes.UCA_NAME,
      value: this.ucaName
    }, {
      name: ErrorContextTypes.UCA_VALUE,
      value: this.ucaValue
    }, {
      name: ErrorContextTypes.UCA_ERROR,
      value: this.ucaError
    }];
  }

}

class UCAVersionError extends UCAUpdateError {
  constructor(message, errorCode, ucaName, ucaVersion, expectedVersion) {
    super(message, errorCode, ucaName);
    this.name = 'UCAVersionError';
    this.ucaVersion = ucaVersion;
    this.expectedVersion = expectedVersion;
  }

  get data() {
    return [{
      name: ErrorContextTypes.UCA_NAME,
      value: this.ucaName
    }, {
      name: ErrorContextTypes.UCA_VERSION,
      value: this.ucaVersion
    }, {
      name: ErrorContextTypes.PLAN_UCA_VERSION,
      value: this.expectedVersion
    }];
  }

}

module.exports = {
  ConfigurationError,
  InvalidEventError,
  MissingEntityError,
  MissingProcessError,
  MissingUCAError,
  MissingPlanError,
  InvalidProcessStateError,
  ProcessIdMismatchError,
  InvalidUCAValueError,
  UCAUpdateError,
  UCAVersionError,
  UCAValueError,
  // Internal only
  MissingEventError,
  InvalidJobError
};