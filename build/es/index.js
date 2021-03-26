const CredentialRequest = require('./cr/CredentialRequest');

const CredentialRequestManager = require('./cr/CredentialRequestManager');

const ValidationProcess = require('./vp/ValidationProcess');

const ValidationErrors = require('./vp/ValidationErrors');

const InternalErrors = require('./vp/InternalErrors');

const Constants = require('./constants');

const Events = require('./vp/Events');

const Utilities = require('./vp/Utilities');

const Tasks = require('./vp/Tasks');

const Context = require('./vp/Context');

const Routes = require('./vp/Routes');

const handlers = require('./vp/Handler');

module.exports = {
  CredentialRequestManager,
  CredentialRequest,
  Constants,
  ValidationProcess,
  ValidationErrors,
  InternalErrors,
  Events,
  Utilities,
  Tasks,
  Context,
  Routes,
  ...handlers
};