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


  async getPlan(name) {
    throw new MissingPlanError(name);
  }
  /**
   * List the plans supported by the IDV
   * @return {Promise<Array.<string>>} The list of supported credential item names
   */


  async listPlans() {
    return [];
  }

}

module.exports = PlanManager;