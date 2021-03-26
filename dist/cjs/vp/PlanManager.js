"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/* eslint-disable class-methods-use-this, no-unused-vars */
const {
  MissingPlanError
} = require('./InternalErrors');
/**
 * Abstract Plan Manager class.
 * Defines the interface for a Plan Manager implementation.
 * The Plan Manager class provides methods to be used in the (validation module) plan resolution.
 * given a credential item name, and in converting a plan into a validation process.
 *
 * This class is designed to be subclassed and not used directly. When used directly
 * it is a noop.
 */


class PlanManager {
  constructor(config = {}) {
    this.config = config;
  }
  /**
   * Resolve to a plan given a credential item name
   * @param name The credential item name
   * @return {Promise<*>} The corresponding plan
   */


  getPlan(name) {
    return _asyncToGenerator(function* () {
      throw new MissingPlanError(name);
    })();
  }
  /**
   * List the plans supported by the IDV
   * @return {Promise<Array.<string>>} The list of supported credential item names
   */


  listPlans() {
    return _asyncToGenerator(function* () {
      return [];
    })();
  }

}

module.exports = PlanManager;