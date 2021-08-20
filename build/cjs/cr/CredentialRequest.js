"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const uuid = require('uuid/v4');

const R = require('ramda');

const {
  VC,
  Claim
} = require('@identity.com/credential-commons');

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
    this.scopeRequestId = jsonObj && jsonObj.scopeRequestId || config && config.scopeRequestId;
    this.idv = jsonObj && jsonObj.idv || config && config.idvDid;
    this.status = jsonObj && jsonObj.status || CredentialRequestStatus.PENDING;
    this.type = jsonObj && jsonObj.type || config && config.credentialRequestType;
    this.acceptedClaims = jsonObj && jsonObj.acceptedClaims || null;
    this.credentialId = jsonObj && jsonObj.credentialId || null;
  }

  static fromJSON(obj) {
    return new CredentialRequest(null, null, R.clone(obj));
  }

  acceptClaims(claims = []) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const promises = claims.map( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (claim) {
          let claimInstance;

          try {
            claimInstance = yield Claim.create(claim.identifier, claim.value); // eslint-disable-line

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

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      const claimInstances = yield Promise.all(promises);
      const c = R.find(R.propEq('checkStatus', 'invalid'), claimInstances);

      if (!R.isNil(c)) {
        throw Error(`There are invalid Claims c=${JSON.stringify(c)}`);
      }

      _this.acceptedClaims = R.clone(claims);
      _this.status = CredentialRequestStatus.ACCEPTED;
    })();
  }

  createCredential(signner = null) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const acceptedClaims = _this2.acceptedClaims || [];
      const claimInstances = yield Promise.all(acceptedClaims.map( /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(function* (claim) {
          return Claim.create(claim.identifier, claim.value);
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      }()));
      const credential = yield VC.create(_this2.credentialItem, _this2.idv, null, claimInstances, 1, null, signner);
      _this2.credentialId = credential.id;
      return credential;
    })();
  }

  anchorCredential(credentialObj, options) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const credential = yield VC.fromJSON(credentialObj);
      const anchoredCredential = yield credential.requestAnchor(options);
      _this3.status = CredentialRequestStatus.ISSUED;
      return anchoredCredential;
    })();
  }

}

module.exports = {
  CredentialRequest,
  CredentialRequestStatus,
  CredentialRequestType
};