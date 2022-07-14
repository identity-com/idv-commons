"use strict";function _slicedToArray(a,b){return _arrayWithHoles(a)||_iterableToArrayLimit(a,b)||_unsupportedIterableToArray(a,b)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(a):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}function _iterableToArrayLimit(a,b){var c=null==a?null:"undefined"!=typeof Symbol&&a[Symbol.iterator]||a["@@iterator"];if(null!=c){var d,e,f=[],g=!0,h=!1;try{for(c=c.call(a);!(g=(d=c.next()).done)&&(f.push(d.value),!(b&&f.length===b));g=!0);}catch(a){h=!0,e=a}finally{try{g||null==c["return"]||c["return"]()}finally{if(h)throw e}}return f}}function _arrayWithHoles(a){if(Array.isArray(a))return a}function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),Object.defineProperty(a,"prototype",{writable:!1}),a}var R=require("ramda"),_require=require("@identity.com/credential-commons"),schemaLoader=_require.schemaLoader,UserCollectableAttribute=_require.UserCollectableAttribute,_require2=require("./ValidationErrors"),BadUCAValueError=_require2.BadUCAValueError,BadValidationProcessError=_require2.BadValidationProcessError,BadValidationUCAError=_require2.BadValidationUCAError,_require3=require("../constants/ValidationConstants"),AggregatedValidationProcessStatus=_require3.AggregatedValidationProcessStatus,ValidationProcessStatus=_require3.ValidationProcessStatus,UCAStatus=_require3.UCAStatus,validIdentifiers=schemaLoader.validUcaIdentifiers,defaultUcaVersion="1",ValidationUCAValue=function(){function a(b,c,d){if(_classCallCheck(this,a),this.name=b,!this.name)throw new Error("you must provide a name for the UCA");this.ucaVersion=d,this.setValue(c)}return _createClass(a,[{key:"setValue",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function b(a){var c;return regeneratorRuntime.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:if(!(this.name&&validIdentifiers.includes(this.name))){b.next=10;break}return b.prev=1,b.next=4,UserCollectableAttribute.create(this.name,a,this.ucaVersion);case 4:c=b.sent,b.next=10;break;case 7:throw b.prev=7,b.t0=b["catch"](1),new BadUCAValueError(this.name,a,b.t0);case 10:this.value=a;case 11:case"end":return b.stop();}},b,this,[[1,7]])}));return function(){return a.apply(this,arguments)}}()},{key:"serialize",value:function(){return{value:this.value}}}],[{key:"create",value:function(){var b=_asyncToGenerator(regeneratorRuntime.mark(function e(b,c,d){var f;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return f=new a(b,c,d),e.next=3,f.setValue(c);case 3:return e.abrupt("return",f);case 4:case"end":return e.stop();}},e)}));return function(){return b.apply(this,arguments)}}()}]),a}(),ValidationUCA=function(){function a(b,c){var d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:defaultUcaVersion,e=3<arguments.length?arguments[3]:void 0;_classCallCheck(this,a);var f=function(a,b){var c=R.prop(b,a);if(c)return c;throw new BadValidationUCAError("".concat(b," not present in ").concat(a))};this.ucaMapId=b,this.ucaName=f(c,"name"),this.status=f(c,"status"),this.ucaVersion=d,this.dependsOnStatus=e,this.dependsOn=R.propOr([],"dependsOn",c)}return _createClass(a,[{key:"url",get:function(){return"ucas/".concat(this.ucaMapId)}},{key:"getValueObj",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function b(a){var c;return regeneratorRuntime.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:return b.next=2,ValidationUCAValue.create(this.ucaName,a,this.ucaVersion);case 2:return c=b.sent,b.abrupt("return",c.serialize());case 4:case"end":return b.stop();}},b,this)}));return function(){return a.apply(this,arguments)}}()},{key:"dependsOnArray",get:function(){var b=this;return this.dependsOnValidationUcas=!this.dependsOnValidationUcas&&this.dependsOn&&0<this.dependsOn.length?this.dependsOn.map(function(c){return new a(null,c.uca,b.ucaVersion,c.status)}):[],this.dependsOnValidationUcas}}]),a}(),ValidationProcess=function(){function a(b){_classCallCheck(this,a);var c=function(a,b){var c=R.path(b,a);if(c)return c;throw new BadValidationProcessError("".concat(b," not present in ").concat(JSON.stringify(a)))};this.id=c(b,["id"]),this.credentialItem=c(b,["state","credential"]),this.processUrl=c(b,["processUrl"]),this.status=c(b,["state","status"]),this.ucaVersion=c(b,["state","ucaVersion"]),this.ucas=c(b,["state","ucas"])}return _createClass(a,[{key:"getValidationUcas",value:function(){var a=this;return this.validationUcas||(this.validationUcas=Object.entries(this.ucas).map(function(b){var c=_slicedToArray(b,2),d=c[0],e=c[1];return new ValidationUCA(d,e,a.ucaVersion)})),this.validationUcas}},{key:"getValidationUcasByStatus",value:function(a){return this.getValidationUcas().filter(R.propEq("status",a))}},{key:"getAggregatedValidationProcessStatus",value:function(){if(this.status===ValidationProcessStatus.IN_PROGRESS){var a=this.getValidationUcasByStatus(UCAStatus.AWAITING_USER_INPUT),b=this.getValidationUcasByStatus(UCAStatus.INVALID).filter(function(a){return 0!==a.retriesRemaining});return a.length||b.length?AggregatedValidationProcessStatus.IN_PROGRESS_ACTION_REQUIRED:AggregatedValidationProcessStatus.IN_PROGRESS_VALIDATING}return this.status}}]),a}();module.exports={ValidationProcess:ValidationProcess,ValidationUCA:ValidationUCA,ValidationUCAValue:ValidationUCAValue,BadUCAValueError:BadUCAValueError};