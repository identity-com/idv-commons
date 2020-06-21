const { v4: uuid } = require('uuid');
const _ = require('lodash');
const { VC, Claim } = require('@identity.com/credential-commons');

const CredentialRequestType = {
  INTERACTIVE: 'interactive',
  DIRECT: 'direct'
};

const CredentialRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ISSUED: 'issued',
  FAILED: 'failed',
  CANCELED: 'canceled'
};

class CredentialRequest {
  constructor(credentialItem, config, jsonObj) {
    this.id = jsonObj && jsonObj.id || uuid();
    this.credentialItem = jsonObj && jsonObj.credentialItem || credentialItem;
    this.idv = jsonObj && jsonObj.idv || config && config.idvDid;
    this.status = jsonObj && jsonObj.status || CredentialRequestStatus.PENDING;
    this.type = jsonObj && jsonObj.type || config && config.credentialRequestType;
    this.acceptedClaims = jsonObj && jsonObj.acceptedClaims || null;
    this.credentialId = jsonObj && jsonObj.credentialId || null;
  }

  static fromJSON(obj) {
    const newCR = new CredentialRequest(null, null, _.merge({}, obj));
    return newCR;
  }

  acceptClaims(claims) {
    const claimInstances = _.map(claims, claim => {
      let claimInstance;
      try {
        claimInstance = new Claim(claim.identifier, claim.value); // eslint-disable-line
        claimInstance.checkStatus = 'valid';
      } catch (err) {
        claimInstance = {
          checkStatus: 'invalid',
          checkErrorMsg: err.stack,
          claim
        };
      }
      return claimInstance;
    });
    const c = _.find(claimInstances, { checkStatus: 'invalid' });
    if (!_.isNil(c)) {
      // console.log(`c=${JSON.stringify(c)}`);
      // TODO better message here:
      throw Error(`There are invalid Claims c=${JSON.stringify(c)}`);
    }

    this.acceptedClaims = _.merge({}, claims);
    this.status = CredentialRequestStatus.ACCEPTED;
  }

  createCredential() {
    const claimInstances = _.map(this.acceptedClaims, claim => new Claim(claim.identifier, claim.value));
    const credential = new VC(this.credentialItem, this.idv, null, claimInstances, 1);
    this.credentialId = credential.id;
    return credential;
  }

  async anchorCredential(credentialObj, options) {
    const credential = VC.fromJSON(credentialObj);
    const anchoredCredential = await credential.requestAnchor(options);
    this.status = CredentialRequestStatus.ISSUED;
    return anchoredCredential;
  }
}

module.exports = { CredentialRequest, CredentialRequestStatus, CredentialRequestType };