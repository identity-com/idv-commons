'use strict';var _regenerator=require("babel-runtime/regenerator"),_regenerator2=_interopRequireDefault(_regenerator),_asyncToGenerator2=require("babel-runtime/helpers/asyncToGenerator"),_asyncToGenerator3=_interopRequireDefault(_asyncToGenerator2),_stringify=require("babel-runtime/core-js/json/stringify"),_stringify2=_interopRequireDefault(_stringify),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_createClass2=require("babel-runtime/helpers/createClass"),_createClass3=_interopRequireDefault(_createClass2);function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var _require=require("uuid"),uuid=_require.v4,_=require("lodash"),_require2=require("@identity.com/credential-commons"),VC=_require2.VC,Claim=_require2.Claim,CredentialRequestType={INTERACTIVE:"interactive",DIRECT:"direct"},CredentialRequestStatus={PENDING:"pending",ACCEPTED:"accepted",ISSUED:"issued",FAILED:"failed",CANCELED:"canceled"},CredentialRequest=function(){function a(b,c,d){(0,_classCallCheck3.default)(this,a),this.id=d&&d.id||uuid(),this.credentialItem=d&&d.credentialItem||b,this.idv=d&&d.idv||c&&c.idvDid,this.status=d&&d.status||CredentialRequestStatus.PENDING,this.type=d&&d.type||c&&c.credentialRequestType,this.acceptedClaims=d&&d.acceptedClaims||null,this.credentialId=d&&d.credentialId||null}return(0,_createClass3.default)(a,[{key:"acceptClaims",value:function(a){var b=_.map(a,function(a){var b;try{b=new Claim(a.identifier,a.value),b.checkStatus="valid"}catch(c){b={checkStatus:"invalid",checkErrorMsg:c.stack,claim:a}}return b}),d=_.find(b,{checkStatus:"invalid"});if(!_.isNil(d))throw Error("There are invalid Claims c="+(0,_stringify2.default)(d));this.acceptedClaims=_.merge({},a),this.status=CredentialRequestStatus.ACCEPTED}},{key:"createCredential",value:function(){var a=_.map(this.acceptedClaims,function(a){return new Claim(a.identifier,a.value)}),b=new VC(this.credentialItem,this.idv,null,a,1);return this.credentialId=b.id,b}},{key:"anchorCredential",value:function(){var a=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(b,c){var d,e;return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return d=VC.fromJSON(b),a.next=3,d.requestAnchor(c);case 3:return e=a.sent,this.status=CredentialRequestStatus.ISSUED,a.abrupt("return",e);case 6:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()}],[{key:"fromJSON",value:function(b){var c=new a(null,null,_.merge({},b));return c}}]),a}();module.exports={CredentialRequest:CredentialRequest,CredentialRequestStatus:CredentialRequestStatus,CredentialRequestType:CredentialRequestType};