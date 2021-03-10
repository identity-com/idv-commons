const R = require('ramda');

const credentialCommons = require('@identity.com/credential-commons');

const {
  CredentialRequest
} = require('./CredentialRequest');

class CredentialRequestManager {
  constructor(options) {
    this.options = options;
    const anchorServicePluginImpl = R.path(['serverConfig', 'anchorService', 'pluginImpl'], options);

    if (anchorServicePluginImpl) {
      const anchorServicePluginConfig = R.path(['serverConfig', 'anchorService', 'pluginConfig'], options);
      anchorServicePluginImpl(credentialCommons, anchorServicePluginConfig);
    }
  }

  createCredentialRequest(credentialItem, scopeRequestId) {
    return new CredentialRequest(credentialItem, {
      scopeRequestId,
      ...this.options.serverConfig
    });
  }

}

module.exports = CredentialRequestManager;