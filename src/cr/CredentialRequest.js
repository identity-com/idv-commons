const uuid = require('uuid/v4');
const R = require('ramda');
const { VC, Claim } = require('@identity.com/credential-commons');

const CredentialRequestType = {
  INTERACTIVE: 'interactive',
  DIRECT: 'direct',
};

const CredentialRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ISSUED: 'issued',
  FAILED: 'failed',
  CANCELED: 'canceled',
};

class CredentialRequest {
  constructor(credentialItem, config, jsonObj) {
    this.id = (jsonObj && jsonObj.id) || uuid();
    this.credentialItem = (jsonObj && jsonObj.credentialItem) || credentialItem;
    this.scopeRequestId = (jsonObj && jsonObj.scopeRequestId) || (config && config.scopeRequestId);
    this.idv = (jsonObj && jsonObj.idv) || (config && config.idvDid);
    this.status = (jsonObj && jsonObj.status) || CredentialRequestStatus.PENDING;
    this.type = (jsonObj && jsonObj.type) || (config && config.credentialRequestType);
    this.acceptedClaims = (jsonObj && jsonObj.acceptedClaims) || null;
    this.credentialId = (jsonObj && jsonObj.credentialId) || null;
  }

  static fromJSON(obj) {
    return new CredentialRequest(null, null, R.clone(obj));
  }

  async acceptClaims(claims = []) {
    const claimInstances = [];
    claims.reduce(async (promise, claim) => {
      let claimInstance;
      try {
        claimInstance = await Claim.create(claim.identifier, claim.value); // eslint-disable-line
        claimInstance.checkStatus = 'valid';
      } catch (err) {
        claimInstance = {
          checkStatus: 'invalid',
          checkErrorMsg: err.stack,
          claim,
        };
      }
      claimInstances.push(claimInstance);
    }, Promise.resolve());

    const c = R.find(R.propEq('checkStatus', 'invalid'), claimInstances);
    if (!R.isNil(c)) {
      throw Error(`There are invalid Claims c=${JSON.stringify(c)}`);
    }

    this.acceptedClaims = R.clone(claims);
    this.status = CredentialRequestStatus.ACCEPTED;
  }

  async createCredential(signner = null) {
    const acceptedClaims = this.acceptedClaims || [];

    const claimInstances = await Promise.all(acceptedClaims.map(
      async (claim) => Claim.create(claim.identifier, claim.value),
    ));

    const credential = await VC.create(this.credentialItem, this.idv, null, claimInstances, 1, null, signner);
    this.credentialId = credential.id;
    return credential;
  }

  async anchorCredential(credentialObj, options) {
    const credential = await VC.fromJSON(credentialObj);
    const anchoredCredential = await credential.requestAnchor(options);
    this.status = CredentialRequestStatus.ISSUED;
    return anchoredCredential;
  }
}

module.exports = { CredentialRequest, CredentialRequestStatus, CredentialRequestType };
