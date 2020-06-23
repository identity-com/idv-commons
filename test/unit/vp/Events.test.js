const { expect } = require('chai');

const { UCAStatus, EventTypes, ValidationProcessStatus } = require('../../../src/constants/ValidationConstants');
const { create } = require('../../../src/vp/Events');
const { InvalidEventError } = require('../../../src/vp/InternalErrors');

const id = '123';
const ucaId = 'abc';
const credentialItemType = 'credential-myCredential-v1';
const ucas = [{ id: 'abc' }, { id: 'def' }];
const ucaValue = '12345';
const taskId = 'abc123';
const taskName = 'xyz';

describe('Events', () => {
  context('Event creator', () => {
    it('should create a process created event', () => {
      const event = create(EventTypes.PROCESS_CREATED, { id, credentialItemType });

      expect(event).to.have.property('type', EventTypes.PROCESS_CREATED);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload).to.have.property('credentialItemType', credentialItemType);
    });

    it('should throw an error if the credential item type is missing in a process created event', () => {
      const shouldFail = () => create(EventTypes.PROCESS_CREATED, {});

      expect(shouldFail).to.throw(InvalidEventError);
    });

    it('should create a process status changed event with an id and status', () => {
      const event = create(EventTypes.PROCESS_STATUS_CHANGED, {
        credentialItemType,
        id,
        oldStatus: ValidationProcessStatus.IN_PROGRESS,
        newStatus: ValidationProcessStatus.COMPLETE,
      });

      expect(event).to.have.property('type', EventTypes.PROCESS_STATUS_CHANGED);
      expect(event.payload).to.have.property('oldStatus', ValidationProcessStatus.IN_PROGRESS);
      expect(event.payload).to.have.property('newStatus', ValidationProcessStatus.COMPLETE);
      expect(event.payload).to.have.property('id', id);
    });

    it('should create a process updated event with an id and updated UCAs', () => {
      const event = create(EventTypes.PROCESS_UPDATED, { credentialItemType, ucas, id });

      expect(event).to.have.property('type', EventTypes.PROCESS_UPDATED);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload.ucas).to.deep.equal(ucas);
    });

    it('should throw an error with both fields if a process updated event without an id and updated UCAs', () => {
      const shouldFail = () => create(EventTypes.PROCESS_UPDATED, { credentialItemType });

      expect(shouldFail).to.throw('Event is missing field(s) id,ucas');
    });

    it('should create a uca received event with an id, ucaId and value', () => {
      const event = create(EventTypes.UCA_RECEIVED, { id, ucaId, value: ucaValue });

      expect(event).to.have.property('type', EventTypes.UCA_RECEIVED);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload).to.have.property('ucaId', ucaId);
      expect(event.payload).to.have.property('value', ucaValue);
    });

    it('should create a uca status changed event with an id, ucaId and status', () => {
      const event = create(EventTypes.UCA_STATUS_CHANGED, {
        id,
        ucaId,
        oldStatus: UCAStatus.AWAITING_USER_INPUT,
        newStatus: UCAStatus.ACCEPTED,
      });

      expect(event).to.have.property('type', EventTypes.UCA_STATUS_CHANGED);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload).to.have.property('ucaId', ucaId);
      expect(event.payload).to.have.property('oldStatus', UCAStatus.AWAITING_USER_INPUT);
      expect(event.payload).to.have.property('newStatus', UCAStatus.ACCEPTED);
    });

    it('should create an external task update event', () => {
      const event = create(EventTypes.EXTERNAL_TASK_UPDATE, { id, taskId });

      expect(event).to.have.property('type', EventTypes.EXTERNAL_TASK_UPDATE);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload).to.have.property('taskId', taskId);
    });

    it('should create an external task update event with additional data', () => {
      const event = create(EventTypes.EXTERNAL_TASK_UPDATE, { id, taskId, x: 'y' });

      expect(event.payload).to.have.property('x', 'y');
    });

    it('should create an external task poll event', () => {
      const event = create(EventTypes.EXTERNAL_TASK_POLL, { id, taskId });

      expect(event).to.have.property('type', EventTypes.EXTERNAL_TASK_POLL);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload).to.have.property('taskId', taskId);
    });

    it('should create an external task poll event with a task name', () => {
      const event = create(EventTypes.EXTERNAL_TASK_POLL, { id, taskName });

      expect(event).to.have.property('type', EventTypes.EXTERNAL_TASK_POLL);
      expect(event.payload).to.have.property('id', id);
      expect(event.payload).to.have.property('taskName', taskName);
    });

    it('should fail to create an external task update event missing a task ID and name', () => {
      const shouldFail = () => create(EventTypes.EXTERNAL_TASK_UPDATE, { id });

      expect(shouldFail).to.throw(InvalidEventError);
    });
  });
});
