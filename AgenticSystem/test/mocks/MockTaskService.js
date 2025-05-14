const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class MockTaskService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.tasks = new Map();
    this.delay = options.delay || 100;
    this.failureRate = options.failureRate || 0.1;
    this.logger = options.logger || console;
  }

  async submitTask(task) {
    const taskId = task.id || uuidv4();
    const taskWithId = { ...task, id: taskId };

    this.tasks.set(taskId, {
      ...taskWithId,
      status: 'PENDING',
      createdAt: new Date()
    });

    // Simulate async processing
    setTimeout(() => {
      this.processTask(taskId);
    }, this.delay);

    return taskId;
  }

  async processTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      this.updateTaskStatus(taskId, 'PROCESSING');

      // Simulate processing time
      await new Promise(resolve => 
        setTimeout(resolve, Math.random() * 1000 + 500)
      );

      // Randomly fail based on failureRate
      if (Math.random() < this.failureRate) {
        throw new Error('Simulated task failure');
      }

      const result = {
        output: `Processed ${task.type} task`,
        metrics: {
          duration: Math.random() * 2000 + 1000,
          memory: Math.random() * 100 + 50
        }
      };

      this.updateTaskStatus(taskId, 'COMPLETED', result);
    } catch (error) {
      this.updateTaskStatus(taskId, 'FAILED', null, error.message);
    }
  }

  updateTaskStatus(taskId, status, result, error) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status,
      updatedAt: new Date()
    };

    if (result) updatedTask.result = result;
    if (error) updatedTask.error = error;

    this.tasks.set(taskId, updatedTask);
    this.emit('taskUpdate', updatedTask);
    this.logger.log(`Task ${taskId} status: ${status}`);
  }

  async getTaskStatus(taskId) {
    return this.tasks.get(taskId) || null;
  }

  async cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'PENDING') {
      this.updateTaskStatus(taskId, 'CANCELLED');
      return true;
    }
    return false;
  }

  async listTasks(filter = {}) {
    const tasks = Array.from(this.tasks.values());
    return tasks.filter(task => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.type && task.type !== filter.type) return false;
      return true;
    });
  }

  clear() {
    this.tasks.clear();
  }
}

module.exports = MockTaskService;
