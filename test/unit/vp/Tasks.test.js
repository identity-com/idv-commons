const { expect } = require('chai');
const timestamp = require('unix-timestamp');

const tasks = require('../../../src/vp/Tasks');
const { TaskStatus } = tasks;

describe('Tasks', () => {
  it('should create a simple task', () => {
    const task = tasks.createSimpleTask();

    expect(new Date(task.expiresAt)).to.be.at.least(new Date());
  });

  it('should add parameters to a simple task', () => {
    const myTaskParameters = {
      someKey: 'some value',
    };

    const task = tasks.createSimpleTask({
      parameters: myTaskParameters,
    });

    expect(task.parameters).to.equal(myTaskParameters);
  });

  it('should check if a task has expired', () => {
    const expiredTask = tasks.createSimpleTask({ taskExpiresAfter: '-1m' });
    const unexpiredTask = tasks.createSimpleTask();

    expect(tasks.isExpired(expiredTask)).to.be.true;
    expect(tasks.isExpired(unexpiredTask)).to.be.false;
  });

  it('should create a polling task', () => {
    const task = tasks.createPollingTask();

    expect(task).to.have.property('interval', '1h');
  });

  it("should get a task's first run time", () => {
    const now = new Date();

    const task = tasks.createPollingTask();
    const expectedNextRunTime = new Date(timestamp.add(now.getTime(), task.interval));

    const nextRunTime = tasks.nextRunTime(task);

    expect(new Date(nextRunTime)).to.be.at.least(expectedNextRunTime);
  });

  it("should get an existing task's next run time", () => {
    // create a task that has already been run once
    const initialTask = tasks.createPollingTask();
    const task = tasks.updateTask(initialTask, tasks.nextRunTime(initialTask));
    const lastRun = new Date(task.lastRun || task.createdAt);
    const expectedNextRunTime = timestamp.toDate(timestamp.add(timestamp.fromDate(lastRun), task.interval));

    const nextRunTime = new Date(tasks.nextRunTime(task));
    expect(nextRunTime.toString()).to.equal(expectedNextRunTime.toString());
  });

  it('should check if a task should be run', () => {
    const taskDueToRun = tasks.createPollingTask({ interval: '-1m' });
    const taskNotDueToRun = tasks.createPollingTask();

    expect(tasks.shouldRun(taskDueToRun)).to.be.true;
    expect(tasks.shouldRun(taskNotDueToRun)).to.be.false;
  });

  it('should not run a completed task', () => {
    const taskDueToRun = tasks.createPollingTask({ interval: '-1m' });
    const taskNotDueToRun = tasks.createPollingTask({ interval: '-1m' });
    taskNotDueToRun.status = TaskStatus.COMPLETED;

    expect(tasks.shouldRun(taskDueToRun)).to.be.true;
    expect(tasks.shouldRun(taskNotDueToRun)).to.be.false;
  });

  it('should not run a task if nextRunTime inside wait interval', () => {
    const oneHour = 60 * 60 * 1000; /* ms */
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - oneHour);
    const sevenHoursAgo = new Date(now.getTime() - oneHour * 7);

    const taskDueToRun = tasks.createPollingTask({ interval: '6h' });
    taskDueToRun.lastRun = sevenHoursAgo;

    const taskNotDueToRun = tasks.createPollingTask({ interval: '6h' });
    taskNotDueToRun.lastRun = oneHourAgo;

    expect(tasks.shouldRun(taskDueToRun)).to.be.true;
    expect(tasks.shouldRun(taskNotDueToRun)).to.be.false;
  });

  it('should update a task run count after running', () => {
    const task = tasks.createPollingTask();
    const updatedTask = tasks.updateTask(task);

    expect(updatedTask).to.have.property('runCount', task.runCount + 1);
  });

  it('should update a task last run time after running', () => {
    const lastRun = new Date();

    const task = tasks.createPollingTask();
    const updatedTask = tasks.updateTask(task, lastRun);

    expect(updatedTask).to.have.property('lastRun', lastRun.toISOString());
  });
});
