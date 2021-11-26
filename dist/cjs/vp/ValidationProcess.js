"use strict";

const R = require('ramda');

const {
  definitions,
  UserCollectableAttribute
} = require('@identity.com/uca');

const {
  BadUCAValueError,
  BadValidationProcessError,
  BadValidationUCAError
} = require('./ValidationErrors');

const {
  AggregatedValidationProcessStatus,
  ValidationProcessStatus,
  UCAStatus
} = require('../constants/ValidationConstants');

const validIdentifiers = definitions.map(d => d.identifier);
const defaultUcaVersion = '1';
/*
* ValidationUCAValue
* This class is instantiated by the ValidationUCA in the getValueObj method and allows
* the value for the UCA to be validated before being sent to the VM.
* If the value is good, the class is instantiated, and the 'serialize' method returns an object
* ready for sending to the VM
*/

class ValidationUCAValue {
  constructor(name, value, ucaVersion) {
    this.name = name;
    if (!this.name) throw new Error('you must provide a name for the UCA');
    this.ucaVersion = ucaVersion;
    this.setValue(value);
  }

  setValue(value) {
    // check that the input value is valid for this type of UCA
    if (this.name && validIdentifiers.includes(this.name)) {
      // instantiate a UCA to check the value
      try {
        // eslint-disable-next-line no-unused-vars
        const ucaObject = new UserCollectableAttribute(this.name, value, this.ucaVersion);
      } catch (error) {
        throw new BadUCAValueError(this.name, value, error);
      }
    }

    this.value = value;
  } // value can be any type, including an object


  serialize() {
    return {
      value: this.value
    };
  }

}
/*
* ValidationUCA
* this class is used to represent the state of a particular UCA in the validation process
* it use instantiated by a ValidationProcess on a request to the the array of ValidationUCAs
* to create a value associated with this UCA, and send it to the VM, the credential wallet
* can use the propety 'url' to get the URL to send to, where this must be added to the main processUrl.
* e.g. /processUrl/${vUca.url}
* A ValidationUCA can optionally have dependencies which are defined in the 'dependsOn' value passed
* in from the intiial ucaObj. The 'dependsOnStatus' is optional and refers to the the UCA's status if it
* is part of a dependency array for another UCA
* The property 'dependsOnArray' will return an array of instantiated ValidationUCAs, which can be processed in turn
* The method 'getValueObj(value) can be used to validate the value for this UCA by instantiating the
* ValidationUCAValue class. If the value is good, the result is a valid object for sending to the VM
*/


class ValidationUCA {
  constructor(ucaMapId, ucaObj, ucaVersion = defaultUcaVersion, dependsOnStatus) {
    const getOrThrow = (obj, key) => {
      const retVal = R.prop(key, obj);
      if (retVal) return retVal;
      throw new BadValidationUCAError(`${key} not present in ${obj}`);
    }; // the ucaMapId is the string reference used in the process to refer to this UCA
    // it is also used in the URL for patching values to this UCA


    this.ucaMapId = ucaMapId;
    this.ucaName = getOrThrow(ucaObj, 'name');
    this.status = getOrThrow(ucaObj, 'status');
    this.ucaVersion = ucaVersion;
    this.dependsOnStatus = dependsOnStatus;
    this.dependsOn = R.propOr([], 'dependsOn', ucaObj);
  }

  get url() {
    return `ucas/${this.ucaMapId}`;
  }

  getValueObj(value) {
    // ValidationUCAValue will throw an error if the value isn't good for the UCA type
    const validationUCAValueInst = new ValidationUCAValue(this.ucaName, value, this.ucaVersion);
    return validationUCAValueInst.serialize();
  }

  get dependsOnArray() {
    if (!this.dependsOnValidationUcas && this.dependsOn && this.dependsOn.length > 0) {
      // eslint-disable-next-line no-unused-vars, no-undef
      this.dependsOnValidationUcas = this.dependsOn.map(dependsOnObj => new ValidationUCA(null, dependsOnObj.uca, this.ucaVersion, dependsOnObj.status));
    } else {
      this.dependsOnValidationUcas = [];
    }

    return this.dependsOnValidationUcas;
  }

}
/*
* The ValidationProcess class is used to parse or create a response from the ValidationModule (VM)
* it contains all the information that the credential wallet should need. The ValidationProcess
* class should be instantiated with an object that must contain the following items:
* id: type=string : validation process id. This is created by the VM on a credential request from the Credential Module
* credentialItem: type=string : the identifier for the credentialItem, e.g. credential-cvc:IDVaaS-v1
* processUrl: type=string: the URL that should be used to communicate with the VM with reference to this
*             particular process (it already contains the process id)
* status: type=string: a status defined from the options in ValidationProcessStatus
* ucaVersion: type=string: the version of all the ucas defined in the uca object
* ucas: type=Object: an object containing ucaMapId:ucaObject, where the ucaMapId will be used
*       to send a value for this UCA to the VM
* helper methods to get an array of ValidationUCAs are provided, and these should be used rather than
* delaing with the ucas array directly
*/


class ValidationProcess {
  constructor(processObj) {
    const getOrThrow = (obj, key) => {
      const retVal = R.path(key, obj);
      if (retVal) return retVal;
      throw new BadValidationProcessError(`${key} not present in ${JSON.stringify(obj)}`);
    };

    this.id = getOrThrow(processObj, ['id']);
    this.credentialItem = getOrThrow(processObj, ['state', 'credential']);
    this.processUrl = getOrThrow(processObj, ['processUrl']);
    this.status = getOrThrow(processObj, ['state', 'status']);
    this.ucaVersion = getOrThrow(processObj, ['state', 'ucaVersion']);
    this.ucas = getOrThrow(processObj, ['state', 'ucas']);
  }

  getValidationUcas() {
    if (!this.validationUcas) {
      this.validationUcas = Object.entries(this.ucas).map(([ucaId, ucaObj]) => new ValidationUCA(ucaId, ucaObj, this.ucaVersion));
    }

    return this.validationUcas;
  }

  getValidationUcasByStatus(status) {
    return this.getValidationUcas().filter(R.propEq('status', status));
  }
  /**
   * Return the AggregatedValidationProcessStatus from the validation process.
   * The aggregated validation process status derived from the validation
   * process status and the UCAs state.
   * @return {AggregatedValidationProcessStatus} the aggregated validation process status
   */


  getAggregatedValidationProcessStatus() {
    if (this.status === ValidationProcessStatus.IN_PROGRESS) {
      const awaitingUserInputUcas = this.getValidationUcasByStatus(UCAStatus.AWAITING_USER_INPUT);
      const invalidUcasWithRetries = this.getValidationUcasByStatus(UCAStatus.INVALID).filter(uca => uca.retriesRemaining !== 0);
      return awaitingUserInputUcas.length || invalidUcasWithRetries.length ? AggregatedValidationProcessStatus.IN_PROGRESS_ACTION_REQUIRED : AggregatedValidationProcessStatus.IN_PROGRESS_VALIDATING;
    }

    return this.status;
  }

}

module.exports = {
  ValidationProcess,
  ValidationUCA,
  ValidationUCAValue,
  BadUCAValueError
};