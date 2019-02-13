const i = require('../../src');

describe('index.js test', () => {
  it('Should instanciate', () => {
    const { CredentialRequestManager, CredentialRequest, Constants } = i;
    expect(CredentialRequestManager).toBeDefined();
    expect(CredentialRequest).toBeDefined();
    expect(Constants.ValidationProcessStatus).toBeDefined();
    expect(Constants.UCAStatus).toBeDefined();
  });
});
