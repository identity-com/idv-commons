const R = require('ramda');
const { expect } = require('chai');

const { replaceUCA } = require('../../../src/vp/Utilities');
const { validationProcessInitialState } = require('../../fixtures/validationProcess.json');

describe('Process utils', () => {
  context('replacing UCAs', () => {
    let state;

    beforeEach(async () => {
      state = R.clone(validationProcessInitialState).state;
    });

    it('should replace a UCA in the state without mutating the state', () => {
      const oldUCA = state.ucas.phoneNumber;

      const value = '123';
      const newUCA = {
        ...oldUCA,
        value,
      };

      const newState = replaceUCA(state, oldUCA, newUCA);

      expect(newState.ucas.phoneNumber).to.have.property('value', value);
      expect(state.ucas.phoneNumber).not.to.have.property('value', value);
    });

    it('should replace a UCA in the dependencies of other UCAs', () => {
      const oldUCA = state.ucas.phoneNumber;

      const value = '123';
      const newUCA = {
        ...oldUCA,
        value,
      };

      const newState = replaceUCA(state, oldUCA, newUCA);

      expect(newState.ucas.phoneNumberToken.dependsOn[0].uca).to.have.property('value', value);
    });
  });
});
