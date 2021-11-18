/* eslint-disable class-methods-use-this, max-classes-per-file */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const { schemaLoader, CVCSchemaLoader } = require('@identity.com/credential-commons');
const { UCAStatus, ValidationProcessStatus, EventTypes } = require('../../../src/constants/ValidationConstants');
const { create } = require('../../../src/vp/Events');
const { MissingUCAError, UCAUpdateError } = require('../../../src/vp/InternalErrors');
const {
  Handler, TypeHandler, UCAHandler, ExternalTaskHandler, ValidatingHandler,
} = require('../../../src/vp/Handler');
const { createSimpleTask } = require('../../../src/vp/Tasks');
const InternalErrors = require('../../../src/vp/InternalErrors');

chai.use(chaiAsPromised);
const { expect } = chai;

const sandbox = sinon.createSandbox();

const processId = '1';
const ucaId = 'number';
const ucaName = 'myUCA';
const ucaValue = 'abc';
const ucaPhoneValue = '691242538';
const ucaReceivedEvent = create(EventTypes.UCA_RECEIVED, { id: processId, ucaId, value: ucaValue });
const ucaPhoneNumberReceivedEvent = create(EventTypes.UCA_RECEIVED, { id: processId, ucaId, value: ucaPhoneValue });
const taskName = 'testTask';
const externalTaskEvent = create(EventTypes.EXTERNAL_TASK_POLL, { id: new Date().getTime(), taskName });
const simpleState = 'some state';
const phoneNumberUCAName = 'cvc:PhoneNumber:number';
const getStateWithUCA = () => ({
  status: ValidationProcessStatus.IN_PROGRESS,
  ucas: {
    [ucaId]: {
      name: ucaName,
      status: UCAStatus.AWAITING_USER_INPUT,
    },
  },
});

const getStateWithPhoneNumberUCA = () => ({
  status: ValidationProcessStatus.IN_PROGRESS,
  ucas: {
    [ucaId]: {
      name: phoneNumberUCAName,
      status: UCAStatus.AWAITING_USER_INPUT,
    },
  },
});

const getLimitedRetriesUCAState = () => {
  const stateWithUCA = getStateWithUCA();

  stateWithUCA.ucas[ucaId].retriesRemaining = 5;

  return stateWithUCA;
};

const externalTask = createSimpleTask({ name: taskName, externalSystemId: 'TestSystemId' });
const getStateWithExternalTask = () => ({
  status: ValidationProcessStatus.IN_PROGRESS,
  externalTasks: [externalTask],
});

describe('Handler classes', () => {
  afterEach(() => sandbox.restore());

  context('Handler', () => {
    it('should behave like a pure function handler', () => {
      const handlerFn = new Handler().toFunction();

      const updatedState = handlerFn(simpleState, ucaReceivedEvent);

      expect(updatedState).to.equal(simpleState);
    });

    it('can be subclassed to provide custom functionality', () => {
      class UpperCaseStateHandler extends Handler {
        handle(state) {
          return state.toUpperCase();
        }
      }

      const handlerFn = new UpperCaseStateHandler().toFunction();

      const updatedState = handlerFn(simpleState, ucaReceivedEvent);

      expect(updatedState).to.equal(simpleState.toUpperCase());
    });

    it('should return the handler name', () => {
      const handlerObj = new Handler();
      expect(handlerObj.toString()).to.equal('Handler Name: Handler]');
    });
  });

  context('TypeHandler', () => {
    class UpperCaseStateTypeHandler extends TypeHandler {
      handle(state) {
        return state.toUpperCase();
      }
    }

    it('should return the handler name', () => {
      const handlerObj = new UpperCaseStateTypeHandler(EventTypes.PROCESS_CREATED);
      expect(handlerObj.toString()).to.equal('TypeHandler[Process Created] Name: UpperCaseStateTypeHandler]');
    });

    it('should ignore events with the wrong type', () => {
      const someOtherEventType = EventTypes.PROCESS_CREATED;
      const handlerFn = new UpperCaseStateTypeHandler(someOtherEventType).toFunction();

      const updatedState = handlerFn(simpleState, ucaReceivedEvent);

      expect(updatedState).to.equal(simpleState);
    });

    it('should handle events with the right type', () => {
      const handlerFn = new UpperCaseStateTypeHandler(ucaReceivedEvent.type).toFunction();

      const updatedState = handlerFn(simpleState, ucaReceivedEvent);

      expect(updatedState).to.equal(simpleState.toUpperCase());
    });
  });

  context('UCAHandler', () => {
    class SetUCAValueUpperCaseHandler extends UCAHandler {
      handleUCA(value, ucaState) {
        // eslint-disable-next-line no-param-reassign
        ucaState.value = value.toUpperCase();
      }
    }

    class TestPhoneNumberComponentHandler extends UCAHandler {
      // eslint-disable-next-line no-shadow
      constructor(ucaName, ucaVersion = '1') {
        // auto-accept phone number and country code
        super(ucaName, true, ucaVersion);
      }

      handleUCA(value, ucaState) {
        // eslint-disable-next-line no-param-reassign
        ucaState.value = `phoneNumber_${value}`;
      }
    }

    const setUCAValueUpperCaseHandlerFn = new SetUCAValueUpperCaseHandler().toFunction();

    it('should return the handler name', () => {
      const handlerObj = new TestPhoneNumberComponentHandler('PhoneNumber');
      expect(handlerObj.toString()).to.equal('UCAHandler[PhoneNumber]');
    });

    it('should ignore non-UCA-received events', async () => {
      const nonUCAEvent = create(EventTypes.PROCESS_CREATED, { id: processId, credentialItemType: 'abc' });

      const updatedState = await setUCAValueUpperCaseHandlerFn(simpleState, nonUCAEvent);

      expect(updatedState).to.equal(simpleState);
    });

    it('should handle UCA Received events', async () => {
      const updatedState = await setUCAValueUpperCaseHandlerFn(getStateWithUCA(), ucaReceivedEvent);

      expect(updatedState.ucas[ucaId].value).to.equal(ucaValue.toUpperCase());
    });

    it("should throw an error if the UCA referenced in the event doesn't exist", () => {
      const eventForInvalidUCA = create(EventTypes.UCA_RECEIVED, { id: processId, ucaId: 'unknown', value: ucaValue });

      const shouldFail = () => setUCAValueUpperCaseHandlerFn(getStateWithUCA(), eventForInvalidUCA);

      expect(shouldFail).to.throw(MissingUCAError);
    });

    it('should throw an error if the process state has no UCAs', () => {
      const shouldFail = () => setUCAValueUpperCaseHandlerFn(simpleState, ucaReceivedEvent);

      expect(shouldFail).to.throw(MissingUCAError);
    });

    it('should mark the UCA as accepted if autoAccept is true', async () => {
      const handlerFn = new SetUCAValueUpperCaseHandler(null, true).toFunction();

      const updatedState = await handlerFn(getStateWithUCA(), ucaReceivedEvent);

      expect(updatedState.ucas[ucaId].status).to.equal(UCAStatus.ACCEPTED);
    });

    it('should ignore UCA Received events for different UCAs', async () => {
      const handlerFn = new SetUCAValueUpperCaseHandler('some other uca').toFunction();
      const stateWithUCA = getStateWithUCA();

      const updatedState = await handlerFn(stateWithUCA, ucaReceivedEvent);

      expect(updatedState).to.equal(stateWithUCA);
    });

    it('should handle UCA Received events for the specified UCA', async () => {
      const handlerFn = new SetUCAValueUpperCaseHandler(ucaName).toFunction();

      const updatedState = await handlerFn(getStateWithUCA(), ucaReceivedEvent);

      expect(updatedState.ucas[ucaId].value).to.equal(ucaValue.toUpperCase());
    });

    it('should throw an error if the process is in FAILED status', () => {
      const stateWithUCA = getStateWithUCA();
      stateWithUCA.status = ValidationProcessStatus.FAILED;

      const shouldBeRejected = setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });

    it('should throw an error if the process status cannot be determined', () => {
      const stateWithUCA = getStateWithUCA();
      delete stateWithUCA.status;

      const shouldBeRejected = setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });

    it('should throw an error if the UCA status cannot be determined', () => {
      const stateWithUCA = getStateWithUCA();
      delete stateWithUCA.ucas[ucaId].status;

      const shouldBeRejected = setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });

    it('should throw an error if the UCA is in ACCEPTED status', () => {
      const stateWithUCA = getStateWithUCA();
      stateWithUCA.ucas[ucaId].status = UCAStatus.ACCEPTED;

      const shouldBeRejected = setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });

    it('should throw an error if retriesRemaining is 0', () => {
      const stateWithUCA = getStateWithUCA();
      stateWithUCA.ucas[ucaId].retriesRemaining = 0;

      const shouldBeRejected = setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });

    it('should allow the update if the UCA is in INVALID status and retriesRemaining is > 0', async () => {
      const stateWithUCA = getLimitedRetriesUCAState();
      stateWithUCA.ucas[ucaId].status = UCAStatus.INVALID;

      const updatedState = await setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      expect(updatedState.ucas[ucaId].value).to.equal(ucaValue.toUpperCase());
    });

    it('should allow the update if the UCA is in VALIDATING status and retriesRemaining is > 0', async () => {
      const stateWithUCA = getLimitedRetriesUCAState();
      stateWithUCA.ucas[ucaId].status = UCAStatus.VALIDATING;

      const updatedState = await setUCAValueUpperCaseHandlerFn(stateWithUCA, ucaReceivedEvent);

      expect(updatedState.ucas[ucaId].value).to.equal(ucaValue.toUpperCase());
    });

    it('should decrement the retries remaining if it is set and is non-zero', async () => {
      const stateWithLimitedRetriesUCA = getLimitedRetriesUCAState();
      const initialRetriesRemaining = stateWithLimitedRetriesUCA.ucas[ucaId].retriesRemaining;

      const updatedState = await setUCAValueUpperCaseHandlerFn(stateWithLimitedRetriesUCA, ucaReceivedEvent);

      expect(updatedState.ucas[ucaId].retriesRemaining).to.equal(initialRetriesRemaining - 1);
    });

    it('should handle UCA Received events for an implemented Civic UCA', async () => {
      const handlerFn = new TestPhoneNumberComponentHandler(phoneNumberUCAName).toFunction();
      const updatedState = await handlerFn(getStateWithPhoneNumberUCA(), ucaPhoneNumberReceivedEvent);
      const { error, status } = updatedState.ucas.number;

      expect(status).to.equal(UCAStatus.ACCEPTED);
      expect(error).to.equal(undefined);
      expect(`${updatedState.ucas[ucaId].value}`).to.equal(`phoneNumber_${ucaPhoneValue}`);
    });

    it('should not handle UCA Received events when handler ucaVersion != state UCA version', async () => {
      const handlerFn = new TestPhoneNumberComponentHandler(phoneNumberUCAName, '2').toFunction();

      const shouldBeRejected = handlerFn(getStateWithPhoneNumberUCA(), ucaPhoneNumberReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });

    it('should not handle UCA Received events for unimplemented Civic UCA versions', () => {
      const handlerFn = new TestPhoneNumberComponentHandler(phoneNumberUCAName, '2').toFunction();
      const stateWithPhoneNumberUCA = getStateWithPhoneNumberUCA();
      stateWithPhoneNumberUCA.ucaVersion = '2';
      const shouldBeRejected = handlerFn(stateWithPhoneNumberUCA, ucaPhoneNumberReceivedEvent);

      return expect(shouldBeRejected).to.be.rejectedWith(UCAUpdateError);
    });
  });

  context('ValidatingHandler', () => {
    it('it should set uca state to VALIDATING', async () => {
      const testState = getStateWithUCA();
      const handlerFn = new ValidatingHandler(ucaName).toFunction();
      const newState = await handlerFn(testState, ucaPhoneNumberReceivedEvent);
      expect(newState.ucas[ucaId].status).to.equal(UCAStatus.VALIDATING);
    });

    it('it should not handle the event', async () => {
      const testState = getStateWithPhoneNumberUCA();
      const handlerFn = new ValidatingHandler(ucaName).toFunction();
      const newState = await handlerFn(testState, ucaPhoneNumberReceivedEvent);
      expect(newState.ucas[ucaId].status).to.equal(UCAStatus.AWAITING_USER_INPUT);
    });
  });

  context('ExternalTaskHandler', () => {
    const testState = getStateWithExternalTask();

    class AssertExternalTaskHandler extends ExternalTaskHandler {
      async handleTask(state, event, task) {
        expect(state).to.equal(testState);
        expect(event).to.equal(externalTaskEvent);
        expect(task).to.equal(externalTask);
        return state;
      }
    }

    it('should handle a external task event', () => {
      const handlerFn = new AssertExternalTaskHandler(EventTypes.EXTERNAL_TASK_POLL, taskName).toFunction();
      handlerFn(testState, externalTaskEvent);
    });

    it('should throw InvalidEventError', () => {
      const handlerFn = new AssertExternalTaskHandler(EventTypes.EXTERNAL_TASK_POLL, taskName).toFunction();
      const fubar = () => handlerFn({}, externalTaskEvent);
      expect(fubar).to.throw(InternalErrors.InvalidEventError);
    });

    it('should return the same object', async () => {
      const handlerFn = new ExternalTaskHandler(EventTypes.EXTERNAL_TASK_POLL, taskName).toFunction();
      expect(await handlerFn(testState, externalTaskEvent)).to.equal(testState);
    });
  });
});
