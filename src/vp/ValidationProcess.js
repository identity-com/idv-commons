const _ = require('lodash');
const { definitions, UserCollectableAttribute } = require('@identity.com/uca');

const validIdentifiers = definitions.map(d => d.identifier);

const defaultUcaVersion = '1';
class BadUCAValueError extends Error {
  constructor(ucaId, value, error) {
    const errMessage = `BadUCAValue: UCA value '${JSON.stringify(value)}' isn't good for UCA Identifier '${ucaId}' UCA error = ${error}`;
    super(errMessage);
    this.name = 'BadUCAValue';
    this.ucaId = ucaId;
    this.value = value;
  }
}
class BadValidationProcessError extends Error {
  constructor(error) {
    super(error);
    this.name = 'BadValidationProcessError';
  }
}
class BadValidationUCAError extends Error {
  constructor(error) {
    super(error);
    this.name = 'BadValidationUCAError';
  }
}

class ValidationUCAValue {
  constructor(name, value, ucaVersion) {
    this.name = name;
    this.ucaVersion = ucaVersion;
    this.setValue(value);
  }

  setValue(value) {
    // check that the input value is valid for this type of UCA
    if (this.name && _.includes(validIdentifiers, this.name)) {
      // instantiate a UCA to check the value
      try {
        // eslint-disable-next-line no-unused-vars
        const ucaObject = new UserCollectableAttribute(this.name, value, this.ucaVersion);
      } catch (error) {
        throw new BadUCAValueError(this.name, value, error);
      }
    }
    this.value = value;
  }

  // value can be any type, including an object
  serialize() {
    return {
      value: this.value,
    };
  }
}

class ValidationUCA {
  constructor(ucaMapId, ucaObj, ucaVersion = defaultUcaVersion, dependsOnStatus) {
    const getOrThrow = (obj, key) => {
      const retVal = _.get(obj, key);
      if (retVal) return retVal;
      throw new BadValidationUCAError(`${key} not present in ${obj}`);
    };
    // the ucaMapId is the string reference used in the process to refer to this UCA
    // it is also used in the URL for patching values to this UCA
    this.ucaMapId = ucaMapId;
    this.ucaName = getOrThrow(ucaObj, 'name');
    this.status = getOrThrow(ucaObj, 'status');
    this.ucaVersion = ucaVersion;
    this.dependsOnStatus = dependsOnStatus;
    this.dependsOn = _.get(ucaObj, 'dependsOn', []);
  }

  get url() {
    return `/ucas/${this.ucaMapId}`;
  }

  getValueObj(value) {
    // ValidationUCAValue will throw an error if the value isn't good for the UCA type
    const validationUCAValueInst = new ValidationUCAValue(this.ucaName, value, this.ucaVersion);
    return validationUCAValueInst.serialize();
  }

  get dependsOnArray() {
    if (!this.dependsOnValidationUcas && this.dependsOn && this.dependsOn.length > 0) {
      // eslint-disable-next-line no-unused-vars, no-undef
      this.dependsOnValidationUcas = _.map(this.dependsOn, dependsOnObj => new ValidationUCA(null, dependsOnObj.uca, this.ucaVersion, dependsOnObj.status));
    }
    return this.dependsOnValidationUcas;
  }
}

class ValidationProcess {
  constructor(processObj) {
    const getOrThrow = (obj, key) => {
      const retVal = _.get(obj, key);
      if (retVal) return retVal;
      throw new BadValidationProcessError(`${key} not present in ${obj}`);
    };
    this.id = getOrThrow(processObj, 'id');
    this.credentialItem = getOrThrow(processObj, 'state.credential');
    this.processUrl = getOrThrow(processObj, 'processUrl');
    this.status = getOrThrow(processObj, 'state.status');
    this.ucaVersion = getOrThrow(processObj, 'state.ucaVersion');
    this.ucas = getOrThrow(processObj, 'state.ucas');
  }

  getValidationUcas() {
    if (!this.validationUcas) {
      // eslint-disable-next-line no-unused-vars, no-undef
      this.validationUcas = _.map(Object.entries(this.ucas), ([ucaId, ucaObj]) => new ValidationUCA(this.ucaMapId, ucaObj, this.ucaVersion));
    }
    return this.validationUcas;
  }

  getValidationUcasByStatus(status) {
    return _.filter(this.getValidationUcas(), vUca => (vUca.status === status));
  }
}

module.exports = {
  ValidationProcess, ValidationUCA, ValidationUCAValue, BadUCAValueError,
};
