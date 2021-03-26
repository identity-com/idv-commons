"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

module.exports = _objectSpread({
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
  Routes
}, handlers);