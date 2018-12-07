'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const { VC, UCA } = require('@identity.com/credential-commons');

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
    this.acceptedUcas = jsonObj && jsonObj.acceptedUcas || null;
    this.credentialId = jsonObj && jsonObj.credentialId || null;
  }

  static fromJSON(obj) {
    const newCR = new CredentialRequest(null, null, _.merge(obj, {}));
    return newCR;
  }

  acceptUcas(ucas) {
    const ucaInstances = _.map(ucas, uca => {
      let ucaInstance;
      try {
        ucaInstance = new UCA(uca.identifier, uca.value); // eslint-disable-line
        ucaInstance.checkStatus = 'valid';
      } catch (err) {
        ucaInstance = {
          checkStatus: 'invalid',
          checkErrorMsg: err.stack,
          uca
        };
      }
      return ucaInstance;
    });
    const c = _.find(ucaInstances, { checkStatus: 'invalid' });
    if (!_.isNil(c)) {
      // console.log(`c=${JSON.stringify(c)}`);
      // TODO better message here:
      throw Error(`There are invalid UCAs c=${JSON.stringify(c)}`);
    }

    this.acceptedUcas = _.merge({}, ucas);
    this.status = CR_STATUSES.ACCEPTED;
    // TOOD: The bellow test has no effect until VCs has validation against UCAs - currently not supported
    // // Check if that ucas can creates the requested credentialIndentifier
    // try {
    //   const check = new VC(this.credentialIdentifier, this.idv, null, ucaInstances, 1); // eslint-disable-line
    //   this.acceptedUcas = _.merge({}, ucas);
    //   this.status = CR_STATUSES.ACCEPTED;
    // } catch (err) {
    //   // console.log(err);
    //   throw err;
    // }
  }

  createCredential() {
    const ucaInstances = _.map(this.acceptedUcas, uca => new UCA(uca.identifier, uca.value));
    const credential = new VC(this.credentialIdentifier, this.idv, null, ucaInstances, 1);
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