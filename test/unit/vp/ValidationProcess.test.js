const chai = require('chai');
const R = require('ramda');

const { expect } = chai;
const {
  validationProcessInitialState,
  validationProcessOneAwaitingUserInputTwoAccepted,
  validationProcessOneInvalidWithRetriesRemaining,
  validationProcessOneValidating,
  validationProcessComplete,
  validUCAObj,
  noStatusUCAObj,
  noNameUCAObj,
  nameUcaVal,
  phoneNumberToken,
  goodUcaValue,
  badUcaValue,
  noDependsUCA,
} = require('../../fixtures/validationProcess');
const {
  ValidationProcess,
  BadValidationProcessError,
  ValidationUCA,
  BadValidationUCAError,
  ValidationUCAValue,
  BadUCAValueError,
} = require('../../../src/vp/ValidationProcess');
const {
  UCAStatus,
  ValidationProcessStatus,
  AggregatedValidationProcessStatus,
} = require('../../../src/constants/ValidationConstants');

describe('ValidationProcess', () => {
  it('Should parse a valid Validation Process', () => {
    const parsedVP = new ValidationProcess(validationProcessInitialState);
    expect(parsedVP).to.be.an.instanceof(ValidationProcess);
    expect(parsedVP.id).to.be.a('string');
    expect(parsedVP.credentialItem).to.be.a('string');
    expect(parsedVP.processUrl).to.be.a('string');
    expect(parsedVP.status).to.be.a('string');
    expect(parsedVP.ucaVersion).to.be.a('string');
    expect(parsedVP.ucas).to.be.a('object');
  });

  it('should throw an error with an invalid Validation Process', () => {
    const necessaryProperties = ['id', 'state.credential', 'processUrl', 'state.status', 'state.ucaVersion', 'state.ucas'];
    necessaryProperties.forEach((element) => {
      const elementPath = element.split('.');
      const invalidationProcessInitialState = R.dissocPath(elementPath, validationProcessInitialState);
      const expectToFail = () => new ValidationProcess(invalidationProcessInitialState);
      expect(expectToFail).to.throw(BadValidationProcessError);
    });
  });

  it('getValidationUcas should return an array of ValidationUCA objects', () => {
    const parsedVP = new ValidationProcess(validationProcessInitialState);
    expect(parsedVP).to.be.an.instanceof(ValidationProcess);

    expect(parsedVP.getValidationUcas()).to.be.a('array');
    expect(parsedVP.getValidationUcas().length).to.be.above(0);
    parsedVP.getValidationUcas().forEach((vUca) => {
      expect(vUca.ucaMapId).to.be.a('string');
      expect(vUca.ucaName).to.be.a('string');
      expect(vUca.ucaVersion).to.be.a('string');
      expect(vUca.url).to.be.a('string');
    });
  });

  it('getValidationUcasByStatus should return the correct number of UCAs', () => {
    const parsedVP = new ValidationProcess(validationProcessOneAwaitingUserInputTwoAccepted);
    expect(parsedVP).to.be.an.instanceof(ValidationProcess);
    expect(parsedVP.getValidationUcasByStatus(UCAStatus.ACCEPTED).length).to.equal(2);
    expect(parsedVP.getValidationUcasByStatus(UCAStatus.AWAITING_USER_INPUT).length).to.equal(1);
  });

  describe('Validation process UCAs summary status', () => {
    it('should return a complete status if validation process is complete', () => {
      const completeVP = new ValidationProcess(validationProcessComplete);
      const aggregatedVPStatus = completeVP.getAggregatedValidationProcessStatus();
      expect(aggregatedVPStatus).to.equal(AggregatedValidationProcessStatus.COMPLETE);
    });

    it('should return a final status if validation process is in a final state', () => {
      const failedVP = new ValidationProcess({
        ...validationProcessComplete,
        state: {
          ...validationProcessComplete.state,
          status: ValidationProcessStatus.FAILED,
        },
      });
      const aggregatedVPStatus = failedVP.getAggregatedValidationProcessStatus();
      expect(aggregatedVPStatus).to.equal(AggregatedValidationProcessStatus.FAILED);
    });

    it('should return IN_PROGRESS_ACTION_REQUIRED if there is any UCA in AWAITING_USER_INPUT', () => {
      const inProgressVP = new ValidationProcess(validationProcessOneAwaitingUserInputTwoAccepted);
      const aggregatedVPStatus = inProgressVP.getAggregatedValidationProcessStatus();
      expect(aggregatedVPStatus).to.equal(AggregatedValidationProcessStatus.IN_PROGRESS_ACTION_REQUIRED);
    });

    it('should return IN_PROGRESS_ACTION_REQUIRED if there is any UCA in INVALID with retries remaining', () => {
      const inProgressVP = new ValidationProcess(validationProcessOneInvalidWithRetriesRemaining);
      const aggregatedVPStatus = inProgressVP.getAggregatedValidationProcessStatus();
      expect(aggregatedVPStatus).to.equal(AggregatedValidationProcessStatus.IN_PROGRESS_ACTION_REQUIRED);
    });

    it('should return IN_PROGRESS_VALIDATING if an in progress process has no awaiting user input or invalid UCA', () => {
      const inProgressVP = new ValidationProcess(validationProcessOneValidating);
      const aggregatedVPStatus = inProgressVP.getAggregatedValidationProcessStatus();
      expect(aggregatedVPStatus).to.equal(AggregatedValidationProcessStatus.IN_PROGRESS_VALIDATING);
    });
  });
});

describe('ValidationUCA', () => {
  it('Should parse a valid ValidationUCA', () => {
    const parsedValidationUCA = new ValidationUCA('test', validUCAObj);
    expect(parsedValidationUCA).to.be.an.instanceof(ValidationUCA);
    expect(parsedValidationUCA.ucaMapId).to.be.a('string');
    expect(parsedValidationUCA.ucaName).to.be.a('string');
    expect(parsedValidationUCA.status).to.be.a('string');
    expect(parsedValidationUCA.dependsOn).to.be.a('array');
    expect(parsedValidationUCA.dependsOnStatus).to.equal(undefined);
    expect(parsedValidationUCA.ucaVersion).to.equal('1');
  });

  it('Should parse a valid ValidationUCA with a dependsOnStatus', () => {
    const parsedValidationUCA = new ValidationUCA('test', validUCAObj, '2', 'VALIDATING');
    expect(parsedValidationUCA).to.be.an.instanceof(ValidationUCA);
    expect(parsedValidationUCA.ucaMapId).to.be.a('string');
    expect(parsedValidationUCA.ucaName).to.be.a('string');
    expect(parsedValidationUCA.status).to.be.a('string');
    expect(parsedValidationUCA.dependsOn).to.be.a('array');
    expect(parsedValidationUCA.dependsOnStatus).to.equal('VALIDATING');
    expect(parsedValidationUCA.ucaVersion).to.equal('2');
  });

  it('should throw an error with no status in ValidationUCA', () => {
    const expectToFail = () => new ValidationUCA('test', noStatusUCAObj, '1');
    expect(expectToFail).to.throw(BadValidationUCAError);
  });

  it('should throw an error with no name in ValidationUCA', () => {
    const expectToFail = () => new ValidationUCA('test', noNameUCAObj, '1');
    expect(expectToFail).to.throw(BadValidationUCAError);
  });

  describe('with a valid ValidationUCA', () => {
    it('should return a valid URL value', () => {
      const parsedValidationUCA = new ValidationUCA('test', validUCAObj, '1');
      expect(parsedValidationUCA.url).to.equal('ucas/test');
    });

    it('should return a valid value object', () => {
      const parsedValidationUCA = new ValidationUCA('test', validUCAObj, '1');
      const expVal = { value: nameUcaVal };
      expect(parsedValidationUCA.getValueObj(nameUcaVal)).to.deep.equal(expVal);
    });

    it('should return a valid dependsOn array', () => {
      const parsedValidationUCA = new ValidationUCA('phoneNumberToken', phoneNumberToken, '1');
      const expDependsOnArray = [
        new ValidationUCA(null, {
          name: 'cvc:PhoneNumber:countryCode',
          status: 'AWAITING_USER_INPUT',
        }, '1', 'VALIDATING'),
        new ValidationUCA(null, {
          name: 'cvc:PhoneNumber:number',
          status: 'AWAITING_USER_INPUT',
        }, '1', 'VALIDATING'),
      ];
      expect(parsedValidationUCA.dependsOnArray).to.deep.equal(expDependsOnArray);
    });

    it('should return an empty dependsOnArray array with no dependsOn', () => {
      const parsedValidationUCA = new ValidationUCA('phoneNumberToken', noDependsUCA, '1');
      expect(parsedValidationUCA.dependsOnArray).to.deep.equal([]);
    });
  });

  describe('ValidationUCAValue', () => {
    it('should be created correctly with a good value', () => {
      const goodUCA = new ValidationUCAValue('cvc:Identity:name', goodUcaValue, '1');
      expect(goodUCA.serialize()).to.deep.equal({ value: goodUcaValue });
    });

    it('should throw an error with a bad value', () => {
      const expectToFail = () => new ValidationUCAValue('cvc:Identity:name', badUcaValue, '1');
      expect(expectToFail).to.throw(BadUCAValueError);
    });

    it('should throw an error with no name', () => {
      const expectToFail = () => new ValidationUCAValue(null, badUcaValue, '1');
      expect(expectToFail).to.throw(Error);
    });

    it('should accept any value for a non-Civic UCA', () => {
      const goodUCA = new ValidationUCAValue('test_uca', 'test_val', '1');
      expect(goodUCA.serialize()).to.deep.equal({ value: 'test_val' });
    });
  });
});
