/**
 * Redis State Manager Configuration
 */
const redis = require('redis');
const { promisify } = require('util');

class RedisPool {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || null,
      db: config.db || 0,
      maxConnections: config.maxConnections || 10,
      idleTimeout: config.idleTimeout || 30000,
      connectionTimeout: config.connectionTimeout || 5000
    };

    this.pool = [];
    this.available = [];
    this.inUse = new Set();
    this.logger = config.logger || console;
  }

  async init() {
    try {
      // Create initial connections
      for (let i = 0; i < this.config.maxConnections; i++) {
        const client = redis.createClient({
          socket: {
            host: this.config.host,
            port: this.config.port,
            connectTimeout: this.config.connectionTimeout
          },
          password: this.config.password,
          database: this.config.db
        });

        // Promisify client methods
        client.getAsync = promisify(client.get).bind(client);
        client.setAsync = promisify(client.set).bind(client);
        client.delAsync = promisify(client.del).bind(client);
        client.quitAsync = promisify(client.quit).bind(client);

        await client.connect();
        this.pool.push(client);
        this.available.push(client);
      }
      this.logger.info('Redis connection pool initialized');
    } catch (error) {
      this.logger.error('Redis pool initialization failed:', error);
      throw error;
    }
  }

  async getConnection() {
    if (this.available.length === 0) {
      throw new Error('No available Redis connections in pool');
    }

    const client = this.available.pop();
    this.inUse.add(client);
    return client;
  }

  releaseConnection(client) {
    if (!this.inUse.has(client)) {
      throw new Error('Attempted to release unacquired connection');
    }

    this.inUse.delete(client);
    this.available.push(client);
  }

  async close() {
    try {
      for (const client of this.pool) {
        await client.quitAsync();
      }
      this.pool = [];
      this.available = [];
      this.inUse.clear();
      this.logger.info('Redis connection pool closed');
    } catch (error) {
      this.logger.error('Error closing Redis pool:', error);
      throw error;
    }
  }
}

module.exports = RedisPool;
