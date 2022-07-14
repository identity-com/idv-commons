"use strict";var _excluded=["id","taskId","taskName"];function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){_defineProperty(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function _objectWithoutProperties(a,b){if(null==a)return{};var c,d,e=_objectWithoutPropertiesLoose(a,b);if(Object.getOwnPropertySymbols){var f=Object.getOwnPropertySymbols(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||Object.prototype.propertyIsEnumerable.call(a,c)&&(e[c]=a[c])}return e}function _objectWithoutPropertiesLoose(a,b){if(null==a)return{};var c,d,e={},f=Object.keys(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||(e[c]=a[c]);return e}var R=require("ramda"),_require=require("./InternalErrors"),InvalidEventError=_require.InvalidEventError,_require2=require("../constants/ValidationConstants"),EventTypes=_require2.EventTypes,eventCreators={},checkFieldsDefined=function(a){var b=Object.keys(a).filter(function(b){return a[b]===void 0});if(b.length)throw new InvalidEventError("Event is missing field(s) ".concat(b,". Event: ").concat(JSON.stringify(a,null,1)));return a},getContext=function(a){var b=a.context;return b||{}},addEventCreator=function(a,b){eventCreators[a]=function(){var c=checkFieldsDefined(b.apply(void 0,arguments)),d=getContext.apply(void 0,arguments);return{type:a,payload:c,context:d}}};addEventCreator(EventTypes.PROCESS_CREATED,function(a){var b=a.id,c=a.credentialItemType;return{id:b,credentialItemType:c}}),addEventCreator(EventTypes.PROCESS_STATUS_CHANGED,function(a){var b=a.id,c=a.oldStatus,d=a.newStatus;return{id:b,oldStatus:c,newStatus:d}}),addEventCreator(EventTypes.PROCESS_UPDATED,function(a){var b=a.id,c=a.ucas;return{id:b,ucas:c}}),addEventCreator(EventTypes.UCA_RECEIVED,function(a){var b=a.id,c=a.ucaId,d=a.value,e=a.applicantFirstName,f=a.applicantLastName;return{id:b,ucaId:c,value:d,applicantFirstName:e||"",applicantLastName:f||""}}),addEventCreator(EventTypes.UCA_STATUS_CHANGED,function(a){var b=a.id,c=a.ucaId,d=a.oldStatus,e=a.newStatus;return{id:b,ucaId:c,oldStatus:d,newStatus:e}});var taskEventPayloadFn=function(a){var b=a.id,c=a.taskId,d=a.taskName,e=_objectWithoutProperties(a,_excluded);if(!c&&!d)throw new InvalidEventError("Event is missing field taskId or taskName. Event: ".concat(JSON.stringify(a,null,1)));return R.mergeAll([_objectSpread({id:b},e),c?{taskId:c}:{},d?{taskName:d}:{}])};addEventCreator(EventTypes.EXTERNAL_TASK_UPDATE,taskEventPayloadFn),addEventCreator(EventTypes.EXTERNAL_TASK_POLL,taskEventPayloadFn);var create=function(a,b){return eventCreators[a](b)};module.exports={create:create};