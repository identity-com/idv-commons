const { expect } = require('chai');
const CredentialRequestManager = require('../../../src/cr/CredentialRequestManager');

describe('CredentialRequestManager', () => {
  it('should construct a CredentialRequestManager without anchor pluging', () => {
    expect(new CredentialRequestManager()).to.not.undefined;
  });
  it('should construct a CredentialRequestManager with anchor pluging', () => {
    const pluginConfig = { dummy: true };
    expect(new CredentialRequestManager({
      serverConfig: {
        anchorService: {
          pluginImpl: (credentialCommons, anchorServicePluginConfig) => {
            expect(credentialCommons).to.not.undefined;
            expect(anchorServicePluginConfig).to.equal(pluginConfig);
          },
          pluginConfig,
        },
      },

    })).to.not.undefined;
  });
});
