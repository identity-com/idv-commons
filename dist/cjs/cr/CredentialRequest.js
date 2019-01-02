'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const { VC, Claim } = require('@identity.com/credential-commons');

const CR_TYPES = {
  INTERACTIVE: 'interactive',
  DIRECT: 'direct'
};

const CR_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ISSUED: 'issued',
  FAILED: 'failed',
  CANCELED: 'canceled'
};

class CredentialRequest {
  constructor(credentialIdentifier, config, jsonObj) {
    this.id = jsonObj && jsonObj.id || uuidv4();
    this.credentialIdentifier = jsonObj && jsonObj.credentialIdentifier || credentialIdentifier;
    this.idv = jsonObj && jsonObj.idv || config && config.idvDid;
    this.status = jsonObj && jsonObj.status || CR_STATUSES.PENDING;
    this.createdOn = jsonObj && jsonObj.createdOn || new Date().getTime();
    this.updatedOn = jsonObj && jsonObj.updatedOn || this.createdOn;
    this.type = jsonObj && jsonObj.type || config && config.credentialRequestType;
    this.acceptedClaims = jsonObj && jsonObj.acceptedClaims || null;
    this.credentialId = jsonObj && jsonObj.credentialId || null;
  }

  static fromJSON(obj) {
    const newCR = new CredentialRequest(null, null, _.merge(obj, {}));
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
    this.status = CR_STATUSES.ACCEPTED;
    // TOOD: The bellow test has no effect until VCs has validation against Claims - currently not supported
    // // Check if that claims can creates the requested credentialIndentifier
    // try {
    //   const check = new VC(this.credentialIdentifier, this.idv, null, claimInstances, 1); // eslint-disable-line
    //   this.acceptedClaims = _.merge({}, claims);
    //   this.status = CR_STATUSES.ACCEPTED;
    // } catch (err) {
    //   // console.log(err);
    //   throw err;
    // }
  }

  createCredential() {
    const claimInstances = _.map(this.acceptedClaims, claim => new Claim(claim.identifier, claim.value));
    const credential = new VC(this.credentialIdentifier, this.idv, null, claimInstances, 1);
    this.credentialId = credential.id;
    return credential;
  }

  anchorCredential(credentialObj, options) {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        const credential = VC.fromJSON(credentialObj);
        const anchoredCredential = yield credential.requestAnchor(options);
        _this.status = CR_STATUSES.ISSUED;
        return anchoredCredential;
      } catch (err) {
        throw err;
      }
    })();
  }
}

module.exports = { CredentialRequest, CR_STATUSES, CR_TYPES };