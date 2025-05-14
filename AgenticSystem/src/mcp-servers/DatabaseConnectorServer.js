const { MCPBaseServer } = require('@manus/mcp-core');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

class DatabaseConnectorServer extends MCPBaseServer {
  constructor(config = {}) {
    super({
      name: 'DatabaseConnector',
      version: '1.0.0',
      description: 'MCP Server for database connectivity',
      ...config
    });

    this.connections = new Map();
    this.registerTools();
  }

  registerTools() {
    // Health check tool
    this.registerTool('healthCheck', {
      description: 'Check server and database connections health',
      parameters: {},
      handler: async () => {
        const results = {
          status: 'healthy',
          timestamp: Date.now(),
          connections: [],
          metrics: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            connectionCount: this.connections.size
          }
        };

        // Test each active connection
        for (const [id, conn] of this.connections) {
          try {
            if (id.startsWith('pg_')) {
              await conn.query('SELECT 1');
              results.connections.push({ id, type: 'postgres', status: 'healthy' });
            } else if (id.startsWith('mysql_')) {
              await conn.query('SELECT 1');
              results.connections.push({ id, type: 'mysql', status: 'healthy' });
            } else if (id.startsWith('mongo_')) {
              await conn.db.admin().ping();
              results.connections.push({ id, type: 'mongodb', status: 'healthy' });
            }
          } catch (error) {
            results.status = 'degraded';
            results.connections.push({
              id,
              type: id.split('_')[0],
              status: 'unhealthy',
              error: error.message
            });
          }
        }

        return results;
      }
    });

    // PostgreSQL tools
    this.registerTool('pgConnect', {
      description: 'Connect to PostgreSQL database',
      parameters: {
        connectionString: { type: 'string', required: true }
      },
      handler: async ({ connectionString }) => {
        const pool = new Pool({ connectionString });
        this.connections.set(`pg_${Date.now()}`, pool);
        return { success: true };
      }
    });

    this.registerTool('pgQuery', {
      description: 'Execute PostgreSQL query',
      parameters: {
        connectionId: { type: 'string', required: true },
        query: { type: 'string', required: true },
        params: { type: 'array' }
      },
      handler: async ({ connectionId, query, params = [] }) => {
        const pool = this.connections.get(connectionId);
        if (!pool) throw new Error('Invalid connection ID');
        const result = await pool.query(query, params);
        return result.rows;
      }
    });

    // MySQL tools
    this.registerTool('mysqlConnect', {
      description: 'Connect to MySQL database',
      parameters: {
        config: { 
          type: 'object',
          required: true,
          schema: {
            host: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
            database: { type: 'string' }
          }
        }
      },
      handler: async ({ config }) => {
        const pool = mysql.createPool(config);
        this.connections.set(`mysql_${Date.now()}`, pool);
        return { success: true };
      }
    });

    this.registerTool('mysqlQuery', {
      description: 'Execute MySQL query',
      parameters: {
        connectionId: { type: 'string', required: true },
        query: { type: 'string', required: true },
        params: { type: 'array' }
      },
      handler: async ({ connectionId, query, params = [] }) => {
        const pool = this.connections.get(connectionId);
        if (!pool) throw new Error('Invalid connection ID');
        const [rows] = await pool.query(query, params);
        return rows;
      }
    });

    // MongoDB tools
    this.registerTool('mongoConnect', {
      description: 'Connect to MongoDB',
      parameters: {
        connectionString: { type: 'string', required: true },
        dbName: { type: 'string', required: true }
      },
      handler: async ({ connectionString, dbName }) => {
        const client = new MongoClient(connectionString);
        await client.connect();
        const db = client.db(dbName);
        this.connections.set(`mongo_${Date.now()}`, { client, db });
        return { success: true };
      }
    });

    this.registerTool('mongoFind', {
      description: 'MongoDB find documents',
      parameters: {
        connectionId: { type: 'string', required: true },
        collection: { type: 'string', required: true },
        query: { type: 'object' },
        options: { type: 'object' }
      },
      handler: async ({ connectionId, collection, query = {}, options = {} }) => {
        const { db } = this.connections.get(connectionId) || {};
        if (!db) throw new Error('Invalid connection ID');
        return db.collection(collection).find(query, options).toArray();
      }
    });

    this.registerTool('mongoInsert', {
      description: 'MongoDB insert documents',
      parameters: {
        connectionId: { type: 'string', required: true },
        collection: { type: 'string', required: true },
        documents: { type: 'array', required: true }
      },
      handler: async ({ connectionId, collection, documents }) => {
        const { db } = this.connections.get(connectionId) || {};
        if (!db) throw new Error('Invalid connection ID');
        const result = await db.collection(collection).insertMany(documents);
        return result;
      }
    });
  }

  async stop() {
    // Clean up all connections
    for (const [id, conn] of this.connections) {
      if (id.startsWith('pg_') || id.startsWith('mysql_')) {
        await conn.end();
      } else if (id.startsWith('mongo_')) {
        await conn.client.close();
      }
    }
    this.connections.clear();
    await super.stop();
  }
}

module.exports = DatabaseConnectorServer;
