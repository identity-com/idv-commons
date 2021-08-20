"use strict";function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var uuid=require("uuid/v4"),R=require("ramda"),_require=require("@identity.com/credential-commons"),VC=_require.VC,Claim=_require.Claim,CredentialRequestType={INTERACTIVE:"interactive",DIRECT:"direct"},CredentialRequestStatus={PENDING:"pending",ACCEPTED:"accepted",ISSUED:"issued",FAILED:"failed",CANCELED:"canceled"},CredentialRequest=function(){function a(b,c,d){_classCallCheck(this,a),this.id=d&&d.id||uuid(),this.credentialItem=d&&d.credentialItem||b,this.scopeRequestId=d&&d.scopeRequestId||c&&c.scopeRequestId,this.idv=d&&d.idv||c&&c.idvDid,this.status=d&&d.status||CredentialRequestStatus.PENDING,this.type=d&&d.type||c&&c.credentialRequestType,this.acceptedClaims=d&&d.acceptedClaims||null,this.credentialId=d&&d.credentialId||null}return _createClass(a,[{key:"acceptClaims",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(){var b,d,e,f,g=arguments;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return b=0<g.length&&void 0!==g[0]?g[0]:[],d=b.map(function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b){var c;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,Claim.create(b.identifier,b.value);case 3:c=a.sent,c.checkStatus="valid",a.next=10;break;case 7:a.prev=7,a.t0=a["catch"](0),c={checkStatus:"invalid",checkErrorMsg:a.t0.stack,claim:b};case 10:return a.abrupt("return",c);case 11:case"end":return a.stop();}},a,null,[[0,7]])}));return function(){return a.apply(this,arguments)}}()),a.next=4,Promise.all(d);case 4:if(e=a.sent,f=R.find(R.propEq("checkStatus","invalid"),e),R.isNil(f)){a.next=8;break}throw Error("There are invalid Claims c=".concat(JSON.stringify(f)));case 8:this.acceptedClaims=R.clone(b),this.status=CredentialRequestStatus.ACCEPTED;case 10:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()},{key:"createCredential",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(){var b,c,d,e,f=arguments;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return b=0<f.length&&void 0!==f[0]?f[0]:null,c=this.acceptedClaims||[],a.next=4,Promise.all(c.map(function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b){return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",Claim.create(b.identifier,b.value));case 1:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}()));case 4:return d=a.sent,a.next=7,VC.create(this.credentialItem,this.idv,null,d,1,null,b);case 7:return e=a.sent,this.credentialId=e.id,a.abrupt("return",e);case 10:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()},{key:"anchorCredential",value:function(){var a=_asyncToGenerator(regeneratorRuntime.mark(function a(b,c){var d,e;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,VC.fromJSON(b);case 2:return d=a.sent,a.next=5,d.requestAnchor(c);case 5:return e=a.sent,this.status=CredentialRequestStatus.ISSUED,a.abrupt("return",e);case 8:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()}],[{key:"fromJSON",value:function(b){return new a(null,null,R.clone(b))}}]),a}();module.exports={CredentialRequest:CredentialRequest,CredentialRequestStatus:CredentialRequestStatus,CredentialRequestType:CredentialRequestType};