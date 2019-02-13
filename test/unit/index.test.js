const idvCommons = require('../../src');

describe('index.js test', () => {
  it('Should instanciate', () => {
    const {
      CredentialRequestManager,
      CredentialRequest,
      Constants,
      ValidationProcess,
      ValidationErrors,
    } = idvCommons;
    expect(CredentialRequestManager).toBeDefined();
    expect(CredentialRequest).toBeDefined();
    expect(Constants.ValidationProcessStatus).toBeDefined();
    expect(Constants.UCAStatus).toBeDefined();
    expect(ValidationProcess).toBeDefined();
    expect(ValidationErrors).toBeDefined();
  });
});
