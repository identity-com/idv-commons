const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const { UCA } = require('@identity.com/credential-commons');

class DCVPStep {
  constructor(identifier, hasPayload, ucas, dependsOn) {
    this.status = 'pending';
    this.identifier = identifier;
    this.hasPayload = hasPayload || false;
    this.payload = this.hasPayload ? null : undefined;
    this.ucas = ucas;
    this.dependsOn = dependsOn;
  }

  static fromJSON(obj) {
    return new DCVPStep(obj.identifier, obj.hasPayload, obj.ucas, obj.dependsOn);
  }
}

const hasDependsPending = (step, allSteps) => {
  let dependsPending = false;
  if (!_.isEmpty(step.dependsOn)) {
    for (let i = 0; i < step.dependsOn.length; i += 1) {
      const dependentStep = _.find(allSteps, os => os.identifier === step.dependsOn[i]);
      if (dependentStep.status === 'pending') dependsPending = true;
      break;
    }
  }
  return dependsPending;
};

class DCVP {
  constructor(dcvpSpec, crId) {
    this.id = uuidv4();
    this.status = 'started';
    this.crId = crId;
    this.credentialIdentifier = dcvpSpec.credentialIdentifier;
    this.description = dcvpSpec.description;
    this.createdOn = new Date().getTime();
    this.steps = _.map(dcvpSpec.steps, s => DCVPStep.fromJSON(s));
  }

  getNextSteps() {
    const nextSteps = _.filter(this.steps, s => {
      if (s.status !== 'pending') return false;
      return !hasDependsPending(s, this.steps);
    });
    return nextSteps;
  }

  addUcaValues(ucaValues) {
    const nextPossibleSteps = this.getNextSteps();
    _.each(ucaValues, ucaValue => {
      this.steps = _.map(this.steps, s => {
        let newStepState;
        // if step s is one of next possible Steps
        if (_.findIndex(nextPossibleSteps, ns => ns.identifier === s.identifier) > -1) {
          const newUcasState = _.map(s.ucas, u => {
            let newUcaValue;
            // if u is the target ucaValue
            if (u.uca === ucaValue.uca) {
              try {
                const ucaChecked = new UCA(ucaValue.uca, ucaValue.value);
                newUcaValue = _.merge({}, { uca: ucaValue.uca, value: ucaChecked.value, status: 'filled' });
              } catch (err) {
                newUcaValue = _.merge({}, { uca: ucaValue.uca, value: ucaValue.value, status: 'invalid_uca_value' });
              }
            } else {
              newUcaValue = _.merge({}, u);
            }
            return newUcaValue;
          });
          let allUcaFilled = true;
          for (let i = 0; i < newUcasState.length; i += 1) {
            allUcaFilled = newUcasState[i].status === 'filled';
            if (!allUcaFilled) break;
          }
          newStepState = _.merge({}, s, {
            status: allUcaFilled ? 'filled' : s.status,
            ucas: newUcasState
          });
        } else {
          newStepState = _.merge({}, s);
        }
        return newStepState;
      });
    });
  }
}

module.exports = DCVP;