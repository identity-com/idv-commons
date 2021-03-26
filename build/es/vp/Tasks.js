/* eslint-disable class-methods-use-this */
const timestamp = require('unix-timestamp');

const uuidV4 = require('uuid/v4');

const R = require('ramda');

const DEFAULT_TASK_EXPIRY = '48h';
const TaskType = {
  POLL: 'Poll'
};
const TaskStatus = {
  COMPLETED: 'COMPLETED'
};

function createSimpleTask({
  name,
  taskExpiresAfter = DEFAULT_TASK_EXPIRY,
  externalSystemId,
  parameters
} = {}) {
  return {
    name,
    externalSystemId,
    id: uuidV4(),
    createdAt: new Date(Date.now()).toISOString(),
    expiresAt: new Date(timestamp.now(taskExpiresAfter) * 1000).toISOString(),
    parameters
  };
}

function createPollingTask(options = {}) {
  const {
    interval = '1h'
  } = options;
  return { ...createSimpleTask(options),
    type: TaskType.POLL,
    interval,
    lastRun: null,
    runCount: 0
  };
}

function isExpired(task) {
  const expiresAtDate = new Date(task.expiresAt);
  return expiresAtDate < new Date();
}

function nextRunTime(task) {
  const lastRunDate = task.lastRun ? new Date(task.lastRun) : new Date(task.createdAt);
  return timestamp.toDate(timestamp.add(timestamp.fromDate(lastRunDate), task.interval || '0s'));
}

function shouldRun(task) {
  return task.type === TaskType.POLL && !(task.status && task.status === TaskStatus.COMPLETED) && nextRunTime(task) < new Date() && !isExpired(task);
}

function updateTask(task, runTime = new Date()) {
  return { ...task,
    lastRun: runTime.toISOString(),
    runCount: task.runCount + 1
  };
}

const findTaskByProperty = (state, propName, propVal) => R.find(R.propEq(propName, propVal), state.externalTasks || []); // returns the task from the state with the given task ID


const getTask = (state, id) => findTaskByProperty(state, 'id', id); // returns the task from the state with the given task name


const getTaskByName = (state, name) => findTaskByProperty(state, 'name', name); // returns the index in the externalTasks array of the given task (or null if not present)
// eslint-disable-next-line no-underscore-dangle


const findTaskIndex = (state, task) => R.when(R.lt(R.__, 0), R.always(null), R.indexOf(task, state.externalTasks)); // replace the old task with the new task in the state


const updateStateTasks = (state, oldTask, newTask) => R.update(findTaskIndex(state, oldTask), newTask, state.externalTasks);

const resolveTask = (state, task, taskStatus = TaskStatus.COMPLETED) => ({ ...state,
  externalTasks: updateStateTasks(state, task, { ...task,
    status: taskStatus
  })
});

module.exports = {
  createPollingTask,
  createSimpleTask,
  isExpired,
  nextRunTime,
  shouldRun,
  updateTask,
  getTask,
  getTaskByName,
  findTaskIndex,
  updateStateTasks,
  resolveTask,
  DEFAULT_TASK_EXPIRY,
  TaskType,
  TaskStatus
};