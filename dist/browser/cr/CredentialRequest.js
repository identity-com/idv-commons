"use strict";function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var _require=require("uuid"),uuid=_require.v4,R=require("ramda"),_require2=require("@identity.com/credential-commons"),VC=_require2.VC,Claim=_require2.Claim,CredentialRequestType={INTERACTIVE:"interactive",DIRECT:"direct"},CredentialRequestStatus={PENDING:"pending",ACCEPTED:"accepted",ISSUED:"issued",FAILED:"failed",CANCELED:"canceled"},CredentialRequest=function(){function a(b,c,d){_classCallCheck(this,a),this.id=d&&d.id||uuid(),this.credentialItem=d&&d.credentialItem||b,this.scopeRequestId=d&&d.scopeRequestId||c&&c.scopeRequestId,this.idv=d&&d.idv||c&&c.idvDid,this.status=d&&d.status||CredentialRequestStatus.PENDING,this.type=d&&d.type||c&&c.credentialRequestType,this.acceptedClaims=d&&d.acceptedClaims||null,this.credentialId=d&&d.credentialId||null}return _createClass(a,[{key:"acceptClaims",value:function(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[],b=a.map(function(a){var b;try{b=new Claim(a.identifier,a.value),b.checkStatus="valid"}catch(c){b={checkStatus:"invalid",checkErrorMsg:c.stack,claim:a}}return b}),d=R.find(R.propEq("checkStatus","invalid"),b);if(!R.isNil(d))throw Error("There are invalid Claims c=".concat(JSON.stringify(d)));this.acceptedClaims=R.clone(a),this.status=CredentialRequestStatus.ACCEPTED}},{key:"createCredential",value:function(){var a=this.acceptedClaims||[],b=a.map(function(a){return new Claim(a.identifier,a.value)}),c=new VC(this.credentialItem,this.idv,null,b,1);return this.credentialId=c.id,c}},{key:"anchorCredential",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){var d,e;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return d=VC.fromJSON(b),a.next=3,d.requestAnchor(c);case 3:return e=a.sent,this.status=CredentialRequestStatus.ISSUED,a.abrupt("return",e);case 6:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()}],[{key:"fromJSON",value:function(b){return new a(null,null,R.clone(b))}}]),a}();module.exports={CredentialRequest:CredentialRequest,CredentialRequestStatus:CredentialRequestStatus,CredentialRequestType:CredentialRequestType};