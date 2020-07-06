const { expect } = require('chai');
const appContext = require('../../../src/vp/Context');

describe('Context', () => {
  context('App config with a logger', () => {
    const log = {
      silly: (...args) => JSON.stringify(args),
      debug: (...args) => JSON.stringify(args),
      info: (...args) => JSON.stringify(args),
      warn: (...args) => JSON.stringify(args),
      error: (...args) => JSON.stringify(args),
    };

    const app = {
      config: {
        handlers: {},
      },
      get: (key) => app.config[key],
      log,
    };
    before(() => {
      appContext.initialize(app);
    });

    it('Should hold the app reference', () => {
      expect(appContext).to.have.property('app', app);
    });

    it('Should have a log defined', () => {
      expect(appContext).to.have.property('log', log);
    });

    it('Should have handlerConfig defined', () => {
      expect(appContext).to.have.property('handlerConfig');
    });

    it('Should wrap the internal logger with state', () => {
      const clog = appContext.contextAwareLogger({ externalId: 'exernal-id' }, log);
      expect(clog.silly('Test log')).to.contains('externalId');
      expect(clog.debug('Test log')).to.contains('externalId');
      expect(clog.info('Test log')).to.contains('externalId');
      expect(clog.warn('Test log')).to.contains('externalId');
      expect(clog.error('Test log')).to.contains('externalId');
    });
  });

  context('App config without a logger', () => {
    const app = {
      config: {
        handlers: {},
      },
      get: (key) => app.config[key],
    };
    before(() => {
      appContext.initialize(app);
    });

    it('Should hold the app reference', () => {
      expect(appContext).to.have.property('app', app);
    });

    it('Should have a log defined', () => {
      expect(appContext).to.have.property('log');
    });

    it('Should have handlerConfig defined', () => {
      expect(appContext).to.have.property('handlerConfig');
    });

    it('Should wrap the internal logger with state', () => {
      const clog = appContext.contextAwareLogger({ externalId: 'exernal-id' });
      expect(() => clog.silly('test')).to.not.throw();
      expect(() => clog.debug('test')).to.not.throw();
      expect(() => clog.info('test')).to.not.throw();
      expect(() => clog.warn('test')).to.not.throw();
      expect(() => clog.error('test')).to.not.throw();
    });
  });
});
