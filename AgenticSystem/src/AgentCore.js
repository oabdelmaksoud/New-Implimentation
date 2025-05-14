/**
 * Base Agent Core class providing common functionality for all agents
 */
class AgentCore {
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();
    this.name = config.name || 'Unnamed Agent';
    this.state = 'initializing';
    this.capabilities = new Set();
    this.eventHandlers = new Map();
    this.taskQueue = [];
    this.logger = config.logger || console;
    this.config = config;
  }

  // Lifecycle methods
  async initialize() {
    this.state = 'initializing';
    try {
      await this.setup();
      this.state = 'ready';
      return true;
    } catch (error) {
      this.state = 'error';
      this.logger.error(`Agent ${this.id} initialization failed:`, error);
      throw error;
    }
  }

  async shutdown() {
    this.state = 'shutting down';
    await this.cleanup();
    this.state = 'terminated';
  }

  // Abstract methods to be implemented by subclasses
  async setup() {
    throw new Error('setup() must be implemented by subclass');
  }

  async cleanup() {
    throw new Error('cleanup() must be implemented by subclass');
  }

  // Event handling
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
  }

  emit(eventName, ...args) {
    const handlers = this.eventHandlers.get(eventName) || [];
    handlers.forEach(handler => handler(...args));
  }

  // Task management
  enqueueTask(task) {
    this.taskQueue.push(task);
    this.emit('taskQueued', task);
  }

  processNextTask() {
    if (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      this.emit('taskStarted', task);
      return task;
    }
    return null;
  }

  // Capability management
  addCapability(capability) {
    this.capabilities.add(capability);
    this.emit('capabilityAdded', capability);
  }

  hasCapability(capability) {
    return this.capabilities.has(capability);
  }

  // State management
  getState() {
    return this.state;
  }

  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.emit('stateChanged', { oldState, newState });
  }

  // Error handling
  handleError(error) {
    this.logger.error(`Agent ${this.id} encountered error:`, error);
    this.emit('error', error);
  }

  // Utility methods
  getConfig(key) {
    return this.config[key];
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }
}

module.exports = AgentCore;
