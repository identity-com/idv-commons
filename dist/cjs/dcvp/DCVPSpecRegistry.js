'use strict';

const _ = require('lodash');
const specs = require('./specs');

class DCVPSpecRegistry {
  //   constructor() {}
  static getSpecFor(credentialIdentifier) {
    const dcvp = _.find(specs, { credentialIdentifier });
    return dcvp;
  }
}

module.exports = DCVPSpecRegistry;