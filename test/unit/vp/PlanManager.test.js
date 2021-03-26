const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const PlanManager = require('../../../src/vp/PlanManager');
const { MissingPlanError } = require('../../../src/vp/InternalErrors');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('PlanManager', () => {
  it('should instantiate PlanManager with no errors', () => {
    expect(
      () => (new PlanManager()),
    ).not.to.throw();
  });

  it('should return a list of empty plans', async () => {
    const planManager = new PlanManager();
    const plans = await planManager.listPlans();
    expect(plans).be.an('array').and.be.empty;
  });

  it('should throw an exception when getting a plan', async () => {
    const planManager = new PlanManager();
    const shouldBeRejected = planManager.getPlan('name');
    expect(shouldBeRejected).to.be.rejectedWith(MissingPlanError);
  });
});
