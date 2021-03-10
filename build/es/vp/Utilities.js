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
    return { ...uca,
      dependsOn: uca.dependsOn.map(dependency => {
        const newDependentUCA = R.equals(dependency.uca.name, oldUCA.name) ? newUCA : replaceDependencies(dependency.uca);
        return { ...dependency,
          uca: newDependentUCA
        };
      })
    };
  };

  const newUCAs = R.map(existingUCA => R.equals(existingUCA, oldUCA) ? newUCA : replaceDependencies(existingUCA), state.ucas);
  return { ...state,
    ucas: newUCAs
  };
};

module.exports = {
  findUCAByName,
  replaceUCA
};