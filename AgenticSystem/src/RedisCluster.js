/**
 * Redis Cluster Configuration
 */
const redis = require('redis');
const { promisify } = require('util');

class RedisCluster {
  constructor(config = {}) {
    this.config = {
      nodes: config.nodes || [
        { host: 'localhost', port: 6379 },
        { host: 'localhost', port: 6380 },
        { host: 'localhost', port: 6381 }
      ],
      password: config.password || null,
      maxRedirections: config.maxRedirections || 16,
      defaults: {
        socket: {
          connectTimeout: config.connectTimeout || 5000,
          tls: config.tls || false
        },
        database: config.db || 0
      }
    };

    this.clients = new Map();
    this.logger = config.logger || console;
  }

  async connect() {
    try {
      for (const node of this.config.nodes) {
        const client = redis.createClient({
          socket: {
            host: node.host,
            port: node.port,
            connectTimeout: this.config.defaults.socket.connectTimeout,
            tls: this.config.defaults.socket.tls
          },
          password: this.config.password,
          database: this.config.defaults.database
        });

        // Promisify client methods
        client.getAsync = promisify(client.get).bind(client);
        client.setAsync = promisify(client.set).bind(client);
        client.delAsync = promisify(client.del).bind(client);
        client.quitAsync = promisify(client.quit).bind(client);

        await client.connect();
        this.clients.set(`${node.host}:${node.port}`, client);
      }
      this.logger.info('Redis cluster connections established');
    } catch (error) {
      this.logger.error('Redis cluster connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      for (const [key, client] of this.clients) {
        await client.quitAsync();
      }
      this.clients.clear();
      this.logger.info('Redis cluster connections closed');
    } catch (error) {
      this.logger.error('Error disconnecting Redis cluster:', error);
      throw error;
    }
  }

  getClient(key) {
    const node = this._determineNode(key);
    return this.clients.get(node);
  }

  _determineNode(key) {
    // Simple hash-based node selection (can be replaced with more sophisticated algorithm)
    const hash = this._hashCode(key);
    const nodeIndex = hash % this.config.nodes.length;
    const node = this.config.nodes[nodeIndex];
    return `${node.host}:${node.port}`;
  }

  _hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

module.exports = RedisCluster;
