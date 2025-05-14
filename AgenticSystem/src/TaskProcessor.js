/**
 * Task Processor Foundation
 */
const { KafkaTopics, KafkaConsumers } = require('./KafkaConfig');
const RedisPool = require('./RedisConfig');
const { EventEmitter } = require('events');

class TaskProcessor extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 10,
      taskTimeout: config.taskTimeout || 30000,
      retryPolicy: config.retryPolicy || {
        maxAttempts: 3,
        backoff: {
          initial: 1000,
          max: 10000,
          factor: 2
        }
      }
    };

    this.activeTasks = new Map();
    this.taskQueue = [];
    this.redisPool = new RedisPool(config.redis);
    this.logger = config.logger || console;
    this.stats = {
      processed: 0,
      failed: 0,
      retries: 0
    };
  }

  async init() {
    try {
      await this.redisPool.init();
      
      // Initialize Kafka consumers
      this.commandConsumer = KafkaConsumers.AGENT_CONTROLLER;
      this.taskConsumer = KafkaConsumers.TASK_PROCESSOR;
      
      // Set up message handlers
      this.commandConsumer.on('message', this.handleCommand.bind(this));
      this.taskConsumer.on('message', this.handleTask.bind(this));
      
      this.logger.info('Task processor initialized');
    } catch (error) {
      this.logger.error('Task processor initialization failed:', error);
      throw error;
    }
  }

  async handleCommand(message) {
    try {
      const command = JSON.parse(message.value);
      switch (command.type) {
        case 'PAUSE':
          this.pauseProcessing();
          break;
        case 'RESUME':
          this.resumeProcessing();
          break;
        case 'STATS':
          this.emit('stats', this.stats);
          break;
        default:
          this.logger.warn(`Unknown command type: ${command.type}`);
      }
    } catch (error) {
      this.logger.error('Command processing failed:', error);
    }
  }

  async handleTask(message) {
    if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
      this.taskQueue.push(message);
      return;
    }

    try {
      const task = JSON.parse(message.value);
      const taskId = task.id || message.offset;
      
      const processingPromise = this.processTask(task);
      this.activeTasks.set(taskId, processingPromise);
      
      processingPromise
        .then(() => {
          this.activeTasks.delete(taskId);
          this.stats.processed++;
          this.processQueue();
        })
        .catch(error => {
          this.activeTasks.delete(taskId);
          this.stats.failed++;
          this.handleTaskError(task, error);
        });
    } catch (error) {
      this.logger.error('Task processing failed:', error);
    }
  }

  async processTask(task) {
    const redisClient = await this.redisPool.getConnection();
    try {
      // Store task state
      await redisClient.setAsync(
        `task:${task.id}`, 
        JSON.stringify({ status: 'processing', startedAt: new Date() })
      );

      // Process task (to be implemented by specific task handlers)
      const result = await this.executeTaskLogic(task);
      
      // Update task state
      await redisClient.setAsync(
        `task:${task.id}`,
        JSON.stringify({ status: 'completed', result, completedAt: new Date() })
      );

      return result;
    } finally {
      this.redisPool.releaseConnection(redisClient);
    }
  }

  async executeTaskLogic(task) {
    // To be implemented by specific task processors
    throw new Error('Task logic not implemented');
  }

  handleTaskError(task, error) {
    const attempts = (task.attempts || 0) + 1;
    
    if (attempts < this.config.retryPolicy.maxAttempts) {
      const delay = Math.min(
        this.config.retryPolicy.backoff.initial * Math.pow(
          this.config.retryPolicy.backoff.factor, 
          attempts - 1
        ),
        this.config.retryPolicy.backoff.max
      );
      
      setTimeout(() => {
        this.stats.retries++;
        this.handleTask({ 
          ...task, 
          attempts,
          lastError: error.message 
        });
      }, delay);
    } else {
      this.logger.error(`Task ${task.id} failed after ${attempts} attempts`, error);
      this.emit('taskFailed', task, error);
    }
  }

  processQueue() {
    while (this.taskQueue.length > 0 && 
           this.activeTasks.size < this.config.maxConcurrentTasks) {
      const message = this.taskQueue.shift();
      this.handleTask(message);
    }
  }

  pauseProcessing() {
    this.isPaused = true;
    this.logger.info('Task processing paused');
  }

  resumeProcessing() {
    this.isPaused = false;
    this.processQueue();
    this.logger.info('Task processing resumed');
  }

  async shutdown() {
    try {
      await this.redisPool.close();
      this.logger.info('Task processor shutdown complete');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = TaskProcessor;
