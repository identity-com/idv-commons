"use strict";function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){_defineProperty(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}var CredentialRequest=require("./cr/CredentialRequest"),CredentialRequestManager=require("./cr/CredentialRequestManager"),ValidationProcess=require("./vp/ValidationProcess"),ValidationErrors=require("./vp/ValidationErrors"),InternalErrors=require("./vp/InternalErrors"),Constants=require("./constants"),Events=require("./vp/Events"),Utilities=require("./vp/Utilities"),Tasks=require("./vp/Tasks"),Context=require("./vp/Context"),Routes=require("./vp/Routes"),handlers=require("./vp/Handler");module.exports=_objectSpread({CredentialRequestManager:CredentialRequestManager,CredentialRequest:CredentialRequest,Constants:Constants,ValidationProcess:ValidationProcess,ValidationErrors:ValidationErrors,InternalErrors:InternalErrors,Events:Events,Utilities:Utilities,Tasks:Tasks,Context:Context,Routes:Routes},handlers);