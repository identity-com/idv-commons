const R = require('ramda');

let appSingleton;

const contextAwareLogger = (state, log) => ({
  silly: (...args) => log.silly(...args, {
    externalId: state.externalId
  }),
  debug: (...args) => log.debug(...args, {
    externalId: state.externalId
  }),
  info: (...args) => log.info(...args, {
    externalId: state.externalId
  }),
  warn: (...args) => log.warn(...args, {
    externalId: state.externalId
  }),
  error: (...args) => log.error(...args, {
    externalId: state.externalId
  })
}); // When the app is not yet initialised, no logger is available
// ensure logging still works, by redirecting to console.log instead

/* eslint-disable no-console */


const consoleLogger = {
  silly: (...args) => console.debug(...args),
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};
/* eslint-enable no-console */
// use getters here so we can take advantage of lazy-loading

const context = {
  get app() {
    return appSingleton;
  },

  get log() {
    if (!R.has('log', appSingleton)) {
      consoleLogger.warn('Context.log: No logger available on the app, falling back to console logger.');
      return consoleLogger;
    }

    if (R.is(Function, appSingleton.log)) return appSingleton.log();
    return appSingleton.log;
  },

  get handlerConfig() {
    return appSingleton.get('handlers');
  },

  // add context to the logger (or a custom logger)
  contextAwareLogger(state, log) {
    const logToWrap = log || context.log;
    return contextAwareLogger(state, logToWrap);
  },

  initialize: app => {
    appSingleton = app;
  }
};
module.exports = context;