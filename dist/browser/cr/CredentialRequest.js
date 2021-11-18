"use strict";function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var uuid=require("uuid/v4"),R=require("ramda"),_require=require("@identity.com/credential-commons"),VC=_require.VC,Claim=_require.Claim,CredentialRequestType={INTERACTIVE:"interactive",DIRECT:"direct"},CredentialRequestStatus={PENDING:"pending",ACCEPTED:"accepted",ISSUED:"issued",FAILED:"failed",CANCELED:"canceled"},CredentialRequest=function(){function a(b,c,d){_classCallCheck(this,a),this.id=d&&d.id||uuid(),this.credentialItem=d&&d.credentialItem||b,this.scopeRequestId=d&&d.scopeRequestId||c&&c.scopeRequestId,this.idv=d&&d.idv||c&&c.idvDid,this.status=d&&d.status||CredentialRequestStatus.PENDING,this.type=d&&d.type||c&&c.credentialRequestType,this.acceptedClaims=d&&d.acceptedClaims||null,this.credentialId=d&&d.credentialId||null}return _createClass(a,[{key:"acceptClaims",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(){var b,d,e,f=arguments;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return b=0<f.length&&void 0!==f[0]?f[0]:[],d=[],a.next=4,b.reduce(function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){var e;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,b;case 2:return a.prev=2,a.next=5,Claim.create(c.identifier,c.value);case 5:e=a.sent,e.checkStatus="valid",a.next=12;break;case 9:a.prev=9,a.t0=a["catch"](2),e={checkStatus:"invalid",checkErrorMsg:a.t0.stack,claim:c};case 12:d.push(e);case 13:case"end":return a.stop();}},a,null,[[2,9]])}));return function(){return a.apply(this,arguments)}}(),Promise.resolve());case 4:if(e=R.find(R.propEq("checkStatus","invalid"),d),R.isNil(e)){a.next=7;break}throw Error("There are invalid Claims c=".concat(JSON.stringify(e)));case 7:this.acceptedClaims=R.clone(b),this.status=CredentialRequestStatus.ACCEPTED;case 9:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()},{key:"createCredential",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(){var b,c,d,e,f=arguments;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return b=0<f.length&&void 0!==f[0]?f[0]:null,c=this.acceptedClaims||[],d=[],a.next=5,c.reduce(function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){var e;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,b;case 2:return a.next=4,Claim.create(c.identifier,c.value);case 4:e=a.sent,d.push(e);case 6:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}(),Promise.resolve());case 5:return a.next=7,VC.create(this.credentialItem,this.idv,null,d,1,null,b);case 7:return e=a.sent,this.credentialId=e.id,a.abrupt("return",e);case 10:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()},{key:"anchorCredential",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){var d,e;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,VC.fromJSON(b);case 2:return d=a.sent,a.next=5,d.requestAnchor(c);case 5:return e=a.sent,this.status=CredentialRequestStatus.ISSUED,a.abrupt("return",e);case 8:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()}],[{key:"fromJSON",value:function(b){return new a(null,null,R.clone(b))}}]),a}();module.exports={CredentialRequest:CredentialRequest,CredentialRequestStatus:CredentialRequestStatus,CredentialRequestType:CredentialRequestType};