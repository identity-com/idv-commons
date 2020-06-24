const { expect } = require('chai');

const idvCommons = require('../../src');

describe('index.js test', () => {
  it('Should instantiate', () => {
    const {
      CredentialRequestManager,
      CredentialRequest,
      Constants,
      ValidationProcess,
      ValidationErrors,
    } = idvCommons;
    expect(CredentialRequestManager).to.exist;
    expect(CredentialRequest).to.exist;
    expect(Constants.ValidationProcessStatus).to.exist;
    expect(Constants.UCAStatus).to.exist;
    expect(ValidationProcess).to.exist;
    expect(ValidationErrors).to.exist;
  });
});
