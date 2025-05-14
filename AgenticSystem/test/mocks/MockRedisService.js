const { EventEmitter } = require('events');
const { promisify } = require('util');

class MockRedisService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.data = new Map();
    this.expirations = new Map();
    this.pubsub = new Map();
    this.logger = options.logger || console;
    this.latency = options.latency || 5;
    
    // Promisify methods
    this.getAsync = promisify(this.get).bind(this);
    this.setAsync = promisify(this.set).bind(this);
    this.delAsync = promisify(this.del).bind(this);
    this.keysAsync = promisify(this.keys).bind(this);
    this.publishAsync = promisify(this.publish).bind(this);
    this.subscribeAsync = promisify(this.subscribe).bind(this);
  }

  getConnection() {
    return Promise.resolve(this);
  }

  get(key, callback) {
    this.simulateLatency(() => {
      if (this.isExpired(key)) {
        this.del(key);
        return callback(null, null);
      }
      callback(null, this.data.get(key) || null);
    });
  }

  set(key, value, ...args) {
    let ex = null;
    let px = null;
    let callback = () => {};

    // Parse SET arguments (simplified)
    for (const arg of args) {
      if (typeof arg === 'function') {
        callback = arg;
      } else if (arg === 'EX') {
        ex = args[args.indexOf(arg) + 1];
      } else if (arg === 'PX') {
        px = args[args.indexOf(arg) + 1];
      }
    }

    this.simulateLatency(() => {
      this.data.set(key, value);
      
      if (ex) {
        this.expirations.set(key, Date.now() + ex * 1000);
      } else if (px) {
        this.expirations.set(key, Date.now() + px);
      }

      callback(null, 'OK');
    });
  }

  del(key, callback) {
    this.simulateLatency(() => {
      const deleted = this.data.delete(key);
      this.expirations.delete(key);
      callback(null, deleted ? 1 : 0);
    });
  }

  keys(pattern, callback) {
    this.simulateLatency(() => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const matches = Array.from(this.data.keys()).filter(k => regex.test(k));
      callback(null, matches);
    });
  }

  publish(channel, message, callback) {
    this.simulateLatency(() => {
      const subscribers = this.pubsub.get(channel) || [];
      subscribers.forEach(sub => sub(channel, message));
      callback(null, subscribers.length);
    });
  }

  subscribe(channel, callback) {
    if (!this.pubsub.has(channel)) {
      this.pubsub.set(channel, []);
    }
    this.pubsub.get(channel).push(callback);
    this.emit('subscribe', channel);
  }

  isExpired(key) {
    if (!this.expirations.has(key)) return false;
    return Date.now() > this.expirations.get(key);
  }

  simulateLatency(fn) {
    setTimeout(fn, Math.random() * this.latency);
  }

  // Test helper methods
  clear() {
    this.data.clear();
    this.expirations.clear();
    this.pubsub.clear();
  }

  dump() {
    return {
      data: Object.fromEntries(this.data),
      expirations: Object.fromEntries(this.expirations),
      subscriptions: Array.from(this.pubsub.keys())
    };
  }
}

module.exports = MockRedisService;
