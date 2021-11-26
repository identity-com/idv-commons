"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const R = require('ramda');
/**
 * Utilities for manipulating process state
 */

/**
 * A helper function that returns the UCA from the state with a particular name
 * @param state
 * @param ucaName
 * @return {*}
 */


function findUCAByName(state, ucaName) {
  const ucaId = R.find(k => state.ucas[k].name === ucaName, Object.keys(state.ucas));
  return state.ucas[ucaId];
}
/**
 * Return a new state with the new UCA replacing the old UCA. Does not mutate the original state
 * @param state The process state to change
 * @param oldUCA The UCA to replace
 * @param newUCA The new UCA
 */


const replaceUCA = (state, oldUCA, newUCA) => {
  const replaceDependencies = uca => {
    if (!uca.dependsOn) return uca;
    return _objectSpread(_objectSpread({}, uca), {}, {
      dependsOn: uca.dependsOn.map(dependency => {
        const newDependentUCA = R.equals(dependency.uca.name, oldUCA.name) ? newUCA : replaceDependencies(dependency.uca);
        return _objectSpread(_objectSpread({}, dependency), {}, {
          uca: newDependentUCA
        });
      })
    });
  };

  const newUCAs = R.map(existingUCA => R.equals(existingUCA, oldUCA) ? newUCA : replaceDependencies(existingUCA), state.ucas);
  return _objectSpread(_objectSpread({}, state), {}, {
    ucas: newUCAs
  });
};

module.exports = {
  findUCAByName,
  replaceUCA
};