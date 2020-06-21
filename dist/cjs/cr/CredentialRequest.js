'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

  anchorCredential(credentialObj, options) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const credential = VC.fromJSON(credentialObj);
      const anchoredCredential = yield credential.requestAnchor(options);
      _this.status = CredentialRequestStatus.ISSUED;
      return anchoredCredential;
    })();
  }
}

module.exports = { CredentialRequest, CredentialRequestStatus, CredentialRequestType };