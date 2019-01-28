
const _ = require('lodash');
const {
  validationProcessInitialState,
  validationProcessOneAwaitingUserInputTwoAccepted,
  validUCAObj,
  noStatusUCAObj,
  noNameUCAObj,
  nameUcaVal,
  phoneNumberToken,
} = require('../../fixtures/validationProcess');
const {
  ValidationProcess,
  BadValidationProcessError,
  ValidationUCA,
  BadValidationUCAError,
} = require('../../../src/vp/ValidationProcess');
const { UCAStatus } = require('../../../src/constants/validationConstants');

describe('ValidationProcess', () => {
  it('parse valid Validation Process', () => {
    /*
    this.id = _.get(processObj, 'id');
    this.credentialItem = _.get(processObj, 'state.credentialItem');
    this.processUrl = _.get(processObj, 'processUrl');
    this.status = _.get(processObj, 'state.status', ValidationProcessStatus.IN_PROGRESS);
    this.ucaVersion = _.get(processObj, 'state.ucaVersion', defaultUcaVersion);
    this.ucas = _.get(processObj, 'state.ucas', {});
    */
    const parsedVP = new ValidationProcess(validationProcessInitialState);
    expect(parsedVP).toBeDefined();
    // console.log(JSON.stringify(parsedVP, null, 2));

    expect(parsedVP.id).toBeDefined();
    expect(parsedVP.credentialItem).toBeDefined();
    expect(parsedVP.processUrl).toBeDefined();
    expect(parsedVP.status).toBeDefined();
    expect(parsedVP.ucaVersion).toBeDefined();
    expect(parsedVP.ucas).toBeDefined();
  });

  it('throws an error with an invalid Validation Process', () => {
    const necessaryProperties = ['id', 'state.credential', 'processUrl', 'state.status', 'state.ucaVersion', 'state.ucas'];
    necessaryProperties.forEach((element) => {
      const invalidationProcessInitialState = _.merge({}, validationProcessInitialState);
      _.unset(invalidationProcessInitialState, element);
      const expextToFail = () => new ValidationProcess(invalidationProcessInitialState);
      expect(expextToFail).toThrowError(BadValidationProcessError);
    });
  });

  it('getValidationUcas returns an array of ValidationUCA objects', () => {
    const parsedVP = new ValidationProcess(validationProcessInitialState);
    expect(parsedVP).toBeDefined();

    expect(parsedVP.getValidationUcas()).toBeDefined();
    // console.log(JSON.stringify(parsedVP.getValidationUcas(), null, 2));
  });

  it('getValidationUcasByStatus returns the correct number of UCAs', () => {
    const parsedVP = new ValidationProcess(validationProcessOneAwaitingUserInputTwoAccepted);
    expect(parsedVP).toBeDefined();
    // console.log(JSON.stringify(parsedVP, null, 2));

    expect(parsedVP.getValidationUcasByStatus(UCAStatus.ACCEPTED).length).toEqual(2);
    expect(parsedVP.getValidationUcasByStatus(UCAStatus.AWAITING_USER_INPUT).length).toEqual(1);
  });
});

describe('ValidationUCA', () => {
  it('parses a valid ValidationUCA', () => {
    /*
    this.ucaMapId = ucaMapId;
    this.ucaName = getOrThrow(ucaObj, 'name');
    this.status = getOrThrow(ucaObj, 'status');
    this.dependsOn = _.get(ucaObj, 'dependsOn');
    this.ucaVersion = ucaVersion;
    */
    const parsedValidationUCA = new ValidationUCA('test', validUCAObj, '1');
    expect(parsedValidationUCA).toBeDefined();
    // console.log(JSON.stringify(parsedValidationUCA, null, 2));

    expect(parsedValidationUCA.ucaMapId).toBeDefined();
    expect(parsedValidationUCA.ucaName).toBeDefined();
    expect(parsedValidationUCA.status).toBeDefined();
    expect(parsedValidationUCA.dependsOn).toBeDefined();
    expect(parsedValidationUCA.ucaVersion).toBeDefined();
  });

  it('throws an error with no status in ValidationUCA', () => {
    const expextToFail = () => new ValidationUCA('test', noStatusUCAObj, '1');
    expect(expextToFail).toThrowError(BadValidationUCAError);
  });

  it('throws an error with no name in ValidationUCA', () => {
    const expextToFail = () => new ValidationUCA('test', noNameUCAObj, '1');
    expect(expextToFail).toThrowError(BadValidationUCAError);
  });

  describe('with a valid ValidationUC', () => {
    it('returns a valid URL value', () => {
      const parsedValidationUCA = new ValidationUCA('test', validUCAObj, '1');
      expect(parsedValidationUCA.url).toBeDefined();
      expect(parsedValidationUCA.url).toEqual('/ucas/test');
    });

    it('returns a valid value object', () => {
      const parsedValidationUCA = new ValidationUCA('test', validUCAObj, '1');
      const expVal = { value: nameUcaVal };
      expect(parsedValidationUCA.getValueObj(nameUcaVal)).toEqual(expVal);
    });

    it('returns a valid dependsOn array', () => {
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
      // console.log(`parsedValidationUCA.dependsOnArray = ${JSON.stringify(parsedValidationUCA.dependsOnArray)}`);
      expect(parsedValidationUCA.dependsOnArray).toEqual(expDependsOnArray);
    });
  });
});
