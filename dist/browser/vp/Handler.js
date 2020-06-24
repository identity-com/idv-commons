"use strict";function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}function _get(a,b,c){return _get="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(a,b,c){var d=_superPropBase(a,b);if(d){var e=Object.getOwnPropertyDescriptor(d,b);return e.get?e.get.call(c):e.value}},_get(a,b,c||a)}function _superPropBase(a,b){for(;!Object.prototype.hasOwnProperty.call(a,b)&&(a=_getPrototypeOf(a),null!==a););return a}function _typeof(a){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}function _inherits(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),b&&_setPrototypeOf(a,b)}function _setPrototypeOf(a,b){return _setPrototypeOf=Object.setPrototypeOf||function(a,b){return a.__proto__=b,a},_setPrototypeOf(a,b)}function _createSuper(a){var b=_isNativeReflectConstruct();return function(){var c,d=_getPrototypeOf(a);if(b){var e=_getPrototypeOf(this).constructor;c=Reflect.construct(d,arguments,e)}else c=d.apply(this,arguments);return _possibleConstructorReturn(this,c)}}function _possibleConstructorReturn(a,b){return b&&("object"===_typeof(b)||"function"==typeof b)?b:_assertThisInitialized(a)}function _assertThisInitialized(a){if(void 0===a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(a){return!1}}function _getPrototypeOf(a){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},_getPrototypeOf(a)}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var R=require("ramda"),_require=require("@identity.com/uca"),definitions=_require.definitions,UserCollectableAttribute=_require.UserCollectableAttribute,_require2=require("@identity.com/credential-commons"),IDVErrorCodes=_require2.errors.idvErrors.IDVErrorCodes,_require3=require("../constants/ValidationConstants"),ValidationProcessStatus=_require3.ValidationProcessStatus,EventTypes=_require3.EventTypes,UCAStatus=_require3.UCAStatus,ClientHints=_require3.ClientHints,contextAwareLogger=function(){return console},log={silly:function(){var a;return(a=console).debug.apply(a,arguments)},debug:function(){var a;return(a=console).debug.apply(a,arguments)},info:function(){var a;return(a=console).info.apply(a,arguments)},warn:function(){var a;return(a=console).warn.apply(a,arguments)},error:function(){var a;return(a=console).error.apply(a,arguments)}},_require4=require("./InternalErrors"),MissingUCAError=_require4.MissingUCAError,UCAUpdateError=_require4.UCAUpdateError,UCAVersionError=_require4.UCAVersionError,UCAValueError=_require4.UCAValueError,validIdentifiers=definitions.map(function(a){return a.identifier}),Handler=function(){function a(){_classCallCheck(this,a)}return _createClass(a,[{key:"canHandle",value:function(){return!0}},{key:"handle",value:function(a){return a}},{key:"toString",value:function(){return"Handler Name: ".concat(this.constructor.name,"]")}},{key:"toFunction",value:function(){var a=this;return function(b,c){return a.canHandle(c,b)?a.handle(b,c):b}}}]),a}(),TypeHandler=function(a){function b(a){var d;return _classCallCheck(this,b),d=c.call(this),d.type=a,d}_inherits(b,a);var c=_createSuper(b);return _createClass(b,[{key:"canHandle",value:function(a){return a.type===this.type}},{key:"toString",value:function(){return"TypeHandler[".concat(this.type,"] Name: ").concat(this.constructor.name,"]")}}]),b}(Handler);function checkUCAIsUpdateable(a,b){if(log.silly("Evaluating if UCA: ".concat(JSON.stringify(a)," is receivable")),!a.status)throw new UCAUpdateError("Unable to determine if the UCA can be updated as it has no status",IDVErrorCodes.ERROR_IDV_UCA_UPDATE_NO_STATUS,a.name);if(!b.status)throw new UCAUpdateError("Unable to determine if the UCA can be updated, because the process it belongs to has no status",IDVErrorCodes.ERROR_IDV_UCA_UPDATE_NO_PROCESS_STATUS,a.name);if(b.status===ValidationProcessStatus.FAILED||b.status===ValidationProcessStatus.CANCELED)throw new UCAUpdateError("Cannot update a UCA on a process in status ".concat(b.status),IDVErrorCodes.ERROR_IDV_PROCESS_HAS_FINAL_STATUS,a.name);if([UCAStatus.AWAITING_DEPENDENCY,UCAStatus.ACCEPTED,UCAStatus.TEMPLATE].includes(a.status))throw new UCAUpdateError("Cannot update a UCA in status ".concat(a.status),IDVErrorCodes.ERROR_IDV_UCA_HAS_FINAL_STATUS,a.name);if(0>=a.retriesRemaining)throw new UCAUpdateError("UCA has no more retries remaining.",IDVErrorCodes.ERROR_IDV_UCA_NO_RETRIES,a.name)}var UCAHandler=function(a){function b(){var a,d=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,e=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],f=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"1";return _classCallCheck(this,b),a=c.call(this,EventTypes.UCA_RECEIVED),a.ucaName=d,a.autoAccept=e,a.ucaVersion=f,a}_inherits(b,a);var c=_createSuper(b);return _createClass(b,[{key:"canHandle",value:function(a,c){var d=this;if(!_get(_getPrototypeOf(b.prototype),"canHandle",this).call(this,a,c))return!1;var e=a.payload.ucaId;if(!c.ucas||!c.ucas[e])throw new MissingUCAError(a.payload.id,e);if(!this.ucaName)return!0;var f=Object.keys(c.ucas).filter(function(a){return c.ucas[a].name===d.ucaName});return f.includes(e)}},{key:"handle",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){var d,e,f,g,h;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return d=contextAwareLogger(b,log),e=c.payload,f=e.ucaId,g=e.value,h=b.ucas[f],checkUCAIsUpdateable(h,b),this.validate(g,f,b.ucaVersion),h.value=g,this.autoAccept&&(h.status=UCAStatus.ACCEPTED),h.retriesRemaining&&(h.retriesRemaining-=1),d.debug("Handling UCA: ".concat(JSON.stringify(h))),a.next=11,this.handleUCA(g,h,b);case 11:return a.abrupt("return",b);case 12:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()},{key:"validate",value:function(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"1";if(c!==this.ucaVersion)throw new UCAVersionError("Handler ucaVersion '".concat(this.ucaVersion,"' doesn't equal state ucaVersion '").concat(c,"'"),IDVErrorCodes.ERROR_IDV_UCA_WRONG_VERSION,this.ucaVersion,c);else if(this.ucaName&&R.includes(this.ucaName,validIdentifiers))try{new UserCollectableAttribute(this.ucaName,a,this.ucaVersion)}catch(c){throw new UCAValueError("UCA value '".concat(JSON.stringify(a),"' isn't good for UCA Identifier '").concat(b,"' error = ").concat(c),IDVErrorCodes.ERROR_IDV_UCA_BAD_VALUE,this.ucaName,a,c)}}},{key:"handleUCA",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(){return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}()},{key:"toString",value:function(){return"UCAHandler[".concat(this.ucaName,"]")}}]),b}(TypeHandler),ValidatingHandler=function(a){function b(a,d){return _classCallCheck(this,b),c.call(this,a,!1,d)}_inherits(b,a);var c=_createSuper(b);return _createClass(b,[{key:"canHandle",value:function(a,c){if(!_get(_getPrototypeOf(b.prototype),"canHandle",this).call(this,a,c))return!1;var d=a.payload.ucaId,e=c.ucas[d];return!(R.path(["parameters","clientHints"],e)||[]).includes(ClientHints.PREFILL)}},{key:"handleUCA",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:c.errors=[],c.status=UCAStatus.VALIDATING;case 2:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}()}]),b}(UCAHandler);module.exports={Handler:Handler,TypeHandler:TypeHandler,UCAHandler:UCAHandler,ValidatingHandler:ValidatingHandler};