const i = require('../../src');

describe('index.js test', () => {
  it('Should instanciate', () => {
    const { CredentialRequestManager, CredentialRequest } = i;
    expect(CredentialRequestManager).toBeDefined();
    expect(CredentialRequest).toBeDefined();
  });
});
