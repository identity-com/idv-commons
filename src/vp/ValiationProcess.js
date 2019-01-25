const { ValidationProcessStatus, UCAStatus } = require('../constants/');
const validIdentifiers = definitions.map(d => d.identifier);

const defaultUcaVersion = '1';
class BadUCAValueError extends Error {
  constructor(ucaId, value, error) {
    const errMessage = `BadUCAValue: UCA value '${JSON.stringify(value)}' isn't good for UCA Identifier '${ucaId}' UCA error = ${error}`;
    log.error(errMessage)
    super(errMessage);
    this.name = 'BadUCAValue';
    this.ucaId = ucaId;
    this.value = value;
  }
}

class ValidationUCAValue {
  constructor(name, value, ucaVersion) {
    this.name = name;
    this.value = value;
    this.ucaVersion = ucaVersion;
  }
  set value(value) {
    // check that the input value is valid for this type of UCA
    if (this.name && R.includes(this.name, validIdentifiers)) {
      // instantiate a UCA to check the value
      try {
        const ucaObject = new UserCollectableAttribute(this.name, value, this.ucaVersion);
      } catch (error) {
        throw BadUCAValueError(this.name, value, error);
      }
    }
    this._value = value;
  }
  // value can be any type, including an object
  serialize() {
    return {
      value: this.value
    }
  }
}
class ValidationUCA {
  constructor(ucaMapId, name, status, dependsOn = null, ucaVersion = '1') {
    // the ucaMapId is the string reference used in the process to refer to this UCA
    // it is also used in the URL for patching values to this UCA
    this.ucaMapId = ucaMapId;
    this.name = name;
    this.status = status;
    this.dependsOn = dependsOn;
    this.ucaVersion = ucaVersion
  }
  static fromObj(ucaMapId, ucaObj, ucaVersion = '1') {
    this.name = _.get(ucaObj, 'name');
    this.status = _.get(ucaObj, 'status');
    this.dependsOn = _.get(ucaObj, 'dependsOn');
    return new ValidationUCA(ucaMapId, name, status, dependsOn, ucaVersion);
  }
  
  get url() {
    return `/ucas/${this.ucaMapId}`;
  }

  getValueObj(value) {
    // ValidationUCAValue will throw an error if the value isn't good for the UCA type
    const validationUCAValueInst =  new ValidationUCAValue(this.name, value, this.ucaVersion);
    return validationUCAValueInst.serialize();
  }
}

class ValidationProcess {

  constructor(processObj) {
    this.id = _.get(processObj, 'id');
    this.credentialItem = _.get(processObj, 'state.credentialItem');
    this.processUrl = _.get(processObj, 'processUrl');
    this.status = _.get(processObj, 'state.status', ValidationProcessStatus.IN_PROGRESS);
    this.ucaVersion = _.get(processObj, 'state.ucaVersion', defaultUcaVersion);
    this.ucas = _.get(processObj, 'state.ucas', {});
  }

  isInState = (status, compState) => status === compState;

  isInProgress(status) {
    return isInState(status, ValidationProcessStatus.IN_PROGRESS);
  }
  isComplete(status) {
    return isInState(status, ValidationProcessStatus.COMPLETE);
  }
  isFailed(status) {
    return isInState(status, ValidationProcessStatus.FAILED);
  }
  isCanceled(status) {
    return isInState(status, ValidationProcessStatus.CANCELED);
  }
  getValidationUcas() {
    return _.map(Object.entries(this.ucas), ([ucaId, ucaObj]) => ValidationUCA.fromObj(fromObj(this.ucaMapId, ucaObj, this.ucaVersion)));
  }
  getValidationUcasByStatus(status) {
    return _.map(this.getValidationUcas(),(vUca) => vUca.status === status);
  }
  getAcceptedValidationUcas() {
    return this.getValidationUcasByStatus(UCAStatus.ACCEPTED);
  }
  getValidationUcasAwaitingUserInput() {
    return this.getValidationUcasByStatus(UCAStatus.AWAITING_USER_INPUT);
  }
}

module.exports = { ValidationProcess, ValidationUCA, ValidationUCAValue, BadUCAValueError }
