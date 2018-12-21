const _ = require('lodash');
const credentialCommons = require('@identity.com/credential-commons');
const { CredentialRequest } = require('./CredentialRequest');

class CredentialRequestManager {
  constructor(options) {
    this.options = options;
    const anchorServicePluginImpl = _.get(options, 'serverConfig.anchorService.pluginImpl');
    if (anchorServicePluginImpl) {
      const anchorServicePluginConfig = _.get(options, 'serverConfig.anchorService.pluginConfig');
      // console.log(anchorServicePluginConfig);
      anchorServicePluginImpl(credentialCommons, anchorServicePluginConfig);
    }
  }

  createCredentialRequest(credentialIdentifier) {
    return new CredentialRequest(credentialIdentifier, this.options.serverConfig);
  }
}

module.exports = CredentialRequestManager;