'use strict';var _getPrototypeOf=require("babel-runtime/core-js/object/get-prototype-of"),_getPrototypeOf2=_interopRequireDefault(_getPrototypeOf),_stringify=require("babel-runtime/core-js/json/stringify"),_stringify2=_interopRequireDefault(_stringify),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_possibleConstructorReturn2=require("babel-runtime/helpers/possibleConstructorReturn"),_possibleConstructorReturn3=_interopRequireDefault(_possibleConstructorReturn2),_inherits2=require("babel-runtime/helpers/inherits"),_inherits3=_interopRequireDefault(_inherits2);function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var BadUCAValueError=function(a){function b(a,c,d){(0,_classCallCheck3.default)(this,b);var e="BadUCAValue: UCA value '"+(0,_stringify2.default)(c)+"' isn't good for UCA Identifier '"+a+"' UCA error = "+d,f=(0,_possibleConstructorReturn3.default)(this,(b.__proto__||(0,_getPrototypeOf2.default)(b)).call(this,e));return f.name="BadUCAValue",f.ucaId=a,f.value=c,f}return(0,_inherits3.default)(b,a),b}(Error),BadValidationProcessError=function(a){function b(a){(0,_classCallCheck3.default)(this,b);var c=(0,_possibleConstructorReturn3.default)(this,(b.__proto__||(0,_getPrototypeOf2.default)(b)).call(this,a));return c.name="BadValidationProcessError",c}return(0,_inherits3.default)(b,a),b}(Error),BadValidationUCAError=function(a){function b(a){(0,_classCallCheck3.default)(this,b);var c=(0,_possibleConstructorReturn3.default)(this,(b.__proto__||(0,_getPrototypeOf2.default)(b)).call(this,a));return c.name="BadValidationUCAError",c}return(0,_inherits3.default)(b,a),b}(Error);module.exports={BadUCAValueError:BadUCAValueError,BadValidationProcessError:BadValidationProcessError,BadValidationUCAError:BadValidationUCAError};