"use strict";

class BadUCAValueError extends Error {
  constructor(ucaId, value, error) {
    const errMessage = `BadUCAValue: UCA value '${JSON.stringify(value)}' isn't good for UCA Identifier '${ucaId}' UCA error = ${error}`;
    super(errMessage);
    this.name = 'BadUCAValue';
    this.ucaId = ucaId;
    this.value = value;
  }

}

class BadValidationProcessError extends Error {
  constructor(error) {
    super(error);
    this.name = 'BadValidationProcessError';
  }

}

class BadValidationUCAError extends Error {
  constructor(error) {
    super(error);
    this.name = 'BadValidationUCAError';
  }

}

module.exports = {
  BadUCAValueError,
  BadValidationProcessError,
  BadValidationUCAError
};