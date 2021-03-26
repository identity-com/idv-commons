"use strict";

const health = 'health';
const batch = 'batch';
const plans = 'plans';
const processes = 'processes';
const status = `${processes}/:processId/status/ucas`;
const ucas = `${processes}/:processId/ucas`;
const claims = `${processes}/:processId/claims`;
const events = `${processes}/:processId/events`;
const external = {
  wallet: 'wallet'
};
module.exports = {
  health,
  batch,
  plans,
  processes,
  ucas,
  claims,
  events,
  external,
  status
};