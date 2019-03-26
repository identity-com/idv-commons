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

  createCredentialRequest(credentialItem) {
    return new CredentialRequest(credentialItem, this.options.serverConfig);
  }
}

module.exports = CredentialRequestManager;