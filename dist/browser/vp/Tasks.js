"use strict";function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){_defineProperty(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}var timestamp=require("unix-timestamp"),_require=require("uuid"),uuidV4=_require.v4,R=require("ramda"),DEFAULT_TASK_EXPIRY="48h",TaskType={POLL:"Poll"};function createSimpleTask(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=a.name,c=a.taskExpiresAfter,d=void 0===c?DEFAULT_TASK_EXPIRY:c,e=a.externalSystemId,f=a.parameters;return{name:b,externalSystemId:e,id:uuidV4(),createdAt:new Date(Date.now()).toISOString(),expiresAt:new Date(1e3*timestamp.now(d)).toISOString(),parameters:f}}function createPollingTask(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=a.interval,c=void 0===b?"1h":b;return _objectSpread(_objectSpread({},createSimpleTask(a)),{},{type:TaskType.POLL,interval:c,lastRun:null,runCount:0})}function isExpired(a){if(a.expired)return!0;var b=new Date(a.expiresAt);return b<new Date}function nextRunTime(a){var b=a.lastRun?new Date(a.lastRun):new Date(a.createdAt);return timestamp.toDate(timestamp.add(timestamp.fromDate(b),a.interval||"0s"))}function shouldRun(a){return a.type===TaskType.POLL&&!(a.status&&"COMPLETED"===a.status)&&nextRunTime(a)<new Date&&!isExpired(a)}function updateTask(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:new Date;return _objectSpread(_objectSpread({},a),{},{lastRun:b.toISOString(),runCount:a.runCount+1})}var findTaskByProperty=function(a,b,c){return R.find(R.propEq(b,c),a.externalTasks||[])},getTask=function(a,b){return findTaskByProperty(a,"id",b)},getTaskByName=function(a,b){return findTaskByProperty(a,"name",b)},findTaskIndex=function(a,b){return R.when(R.lt(R.__,0),R.always(null),R.indexOf(b,a.externalTasks))},updateStateTasks=function(a,b,c){return R.update(findTaskIndex(a,b),c,a.externalTasks)},resolveTask=function(a,b,c){return _objectSpread(_objectSpread({},a),{},{externalTasks:updateStateTasks(a,b,_objectSpread(_objectSpread({},b),{},{status:c}))})};module.exports={createPollingTask:createPollingTask,createSimpleTask:createSimpleTask,isExpired:isExpired,nextRunTime:nextRunTime,shouldRun:shouldRun,updateTask:updateTask,getTask:getTask,getTaskByName:getTaskByName,findTaskIndex:findTaskIndex,updateStateTasks:updateStateTasks,resolveTask:resolveTask,DEFAULT_TASK_EXPIRY:DEFAULT_TASK_EXPIRY,TaskType:TaskType};