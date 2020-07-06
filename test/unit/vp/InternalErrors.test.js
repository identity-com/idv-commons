const { expect } = require('chai');
const {
  errors: {
    idvErrors: { ErrorContextTypes },
  },
} = require('@identity.com/credential-commons');
const InternalErrors = require('../../../src/vp/InternalErrors');

describe('InternalErrors', () => {
  it('Should throw ConfigurationError', () => {
    expect(() => { throw new InternalErrors.ConfigurationError('test'); }).to.throw(InternalErrors.ConfigurationError);
  });

  it('Should throw InvalidEventError', () => {
    expect(() => { throw new InternalErrors.InvalidEventError('test'); }).to.throw(InternalErrors.InvalidEventError);
  });

  it('Should throw InvalidJobError', () => {
    expect(() => { throw new InternalErrors.InvalidJobError('test'); }).to.throw(InternalErrors.InvalidJobError);
  });

  it('Should throw MissingEntityError', () => {
    expect(() => { throw new InternalErrors.MissingEntityError('test'); }).to.throw(InternalErrors.MissingEntityError);
  });

  it('Should throw MissingProcessError', () => {
    const fubar = () => { throw new InternalErrors.MissingProcessError('test'); };
    expect(fubar).to.throw(InternalErrors.MissingProcessError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.PROCESS_ID);
      expect(e.data[0]).to.have.property('value', 'test');
    }
  });

  it('Should throw MissingUCAError', () => {
    const fubar = () => { throw new InternalErrors.MissingUCAError('test'); };
    expect(fubar).to.throw(InternalErrors.MissingUCAError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[1]).to.have.property('name', ErrorContextTypes.PROCESS_ID);
      expect(e.data[1]).to.have.property('value', 'test');
    }
  });

  it('Should throw MissingEventError', () => {
    const fubar = () => { throw new InternalErrors.MissingEventError('test'); };
    expect(fubar).to.throw(InternalErrors.MissingEventError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[1]).to.have.property('name', ErrorContextTypes.PROCESS_ID);
      expect(e.data[1]).to.have.property('value', 'test');
    }
  });

  it('Should throw MissingPlanError', () => {
    const fubar = () => { throw new InternalErrors.MissingPlanError('test'); };
    expect(fubar).to.throw(InternalErrors.MissingPlanError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.CREDENTIAL_ITEM);
      expect(e.data[0]).to.have.property('value', 'test');
    }
  });

  it('Should throw InvalidProcessStateError', () => {
    const fubar = () => { throw new InternalErrors.InvalidProcessStateError(null, 'test'); };
    expect(fubar).to.throw(InternalErrors.InvalidProcessStateError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.UCA_ID);
      expect(e.data[0]).to.have.property('value', 'test');
    }
  });

  it('Should throw ProcessIdMismatchError', () => {
    const fubar = () => { throw new InternalErrors.ProcessIdMismatchError('testxxx', 'test'); };
    expect(fubar).to.throw(InternalErrors.ProcessIdMismatchError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.PROCESS_ID);
      expect(e.data[0]).to.have.property('value', 'test');
    }
  });

  it('Should throw InvalidUCAValueError', () => {
    const fubar = () => { throw new InternalErrors.InvalidUCAValueError(null, null, 'testxxx', 'test'); };
    expect(fubar).to.throw(InternalErrors.InvalidUCAValueError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[1]).to.have.property('name', ErrorContextTypes.UCA_STATE);
      expect(e.data[1]).to.have.property('value', 'test');
    }
  });

  it('Should throw UCAUpdateError', () => {
    const fubar = () => { throw new InternalErrors.UCAUpdateError('test', 'testxxx', 'uca1'); };
    expect(fubar).to.throw(InternalErrors.UCAUpdateError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.UCA_NAME);
      expect(e.data[0]).to.have.property('value', 'uca1');
    }
  });

  it('Should throw UCAValueError', () => {
    const fubar = () => { throw new InternalErrors.UCAValueError('test', 'testxxx', 'uca1', 'ucaValue', new Error('testError')); };
    expect(fubar).to.throw(InternalErrors.UCAValueError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.UCA_NAME);
      expect(e.data[0]).to.have.property('value', 'uca1');
      expect(e.data[1]).to.have.property('name', ErrorContextTypes.UCA_VALUE);
      expect(e.data[1]).to.have.property('value', 'ucaValue');
      expect(e.data[2]).to.have.property('name', ErrorContextTypes.UCA_ERROR);
      expect(e.data[2]).to.have.property('value', 'Error: testError');
    }
  });

  it('Should throw UCAVersionError', () => {
    const fubar = () => { throw new InternalErrors.UCAVersionError('test', 'testxxx', 'uca1', 'v1', 'v2'); };
    expect(fubar).to.throw(InternalErrors.UCAVersionError);
    try {
      fubar();
    } catch (e) {
      expect(e.data[0]).to.have.property('name', ErrorContextTypes.UCA_NAME);
      expect(e.data[0]).to.have.property('value', 'uca1');
      expect(e.data[1]).to.have.property('name', ErrorContextTypes.UCA_VERSION);
      expect(e.data[1]).to.have.property('value', 'v1');
      expect(e.data[2]).to.have.property('name', ErrorContextTypes.PLAN_UCA_VERSION);
      expect(e.data[2]).to.have.property('value', 'v2');
    }
  });
});
