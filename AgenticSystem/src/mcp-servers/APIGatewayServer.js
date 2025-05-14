const { MCPBaseServer } = require('@manus/mcp-core');
const axios = require('axios');
const { GraphQLClient } = require('graphql-request');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const CircuitBreaker = require('opossum');

class APIGatewayServer extends MCPBaseServer {
  constructor(config = {}) {
    super({
      name: 'APIGateway',
      version: '1.0.0',
      description: 'MCP Server for API gateway functionality',
      ...config
    });

    this.endpoints = new Map();
    this.rateLimiters = new Map();
    this.circuitBreakers = new Map();
    this.registerTools();
  }

  registerTools() {
    // Health check tool
    this.registerTool('healthCheck', {
      description: 'Check server and endpoint health status',
      parameters: {},
      handler: async () => {
        const results = {
          status: 'healthy',
          timestamp: Date.now(),
          endpoints: [],
          metrics: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            endpointCount: this.endpoints.size,
            activeCircuitBreakers: Array.from(this.circuitBreakers.values())
              .filter(b => b.opened).length
          }
        };

        // Test each registered endpoint
        for (const [id, endpoint] of this.endpoints) {
          try {
            if (endpoint.type === 'rest') {
              await axios.head(endpoint.baseUrl);
              results.endpoints.push({ id, type: 'rest', status: 'healthy' });
            } else if (endpoint.type === 'graphql') {
              const client = new GraphQLClient(endpoint.url);
              await client.request('{ __typename }');
              results.endpoints.push({ id, type: 'graphql', status: 'healthy' });
            }
          } catch (error) {
            results.status = 'degraded';
            results.endpoints.push({
              id,
              type: endpoint.type,
              status: 'unhealthy',
              error: error.message
            });
          }
        }

        return results;
      }
    });

    // REST API tools
    this.registerTool('registerRestEndpoint', {
      description: 'Register a REST API endpoint',
      parameters: {
        endpointId: { type: 'string', required: true },
        baseUrl: { type: 'string', required: true },
        config: {
          type: 'object',
          schema: {
            auth: { type: 'object' },
            rateLimit: { type: 'object' },
            circuitBreaker: { type: 'object' }
          }
        }
      },
      handler: async ({ endpointId, baseUrl, config = {} }) => {
        // Configure rate limiting
        if (config.rateLimit) {
          const limiter = new RateLimiterMemory({
            points: config.rateLimit.points || 10,
            duration: config.rateLimit.duration || 1
          });
          this.rateLimiters.set(endpointId, limiter);
        }

        // Configure circuit breaker
        if (config.circuitBreaker) {
          const breaker = new CircuitBreaker(async (reqConfig) => {
            return axios(reqConfig);
          }, {
            timeout: config.circuitBreaker.timeout || 3000,
            errorThresholdPercentage: config.circuitBreaker.errorThreshold || 50,
            resetTimeout: config.circuitBreaker.resetTimeout || 30000
          });
          this.circuitBreakers.set(endpointId, breaker);
        }

        this.endpoints.set(endpointId, {
          type: 'rest',
          baseUrl,
          config
        });
        return { success: true };
      }
    });

    this.registerTool('callRestEndpoint', {
      description: 'Call a registered REST endpoint',
      parameters: {
        endpointId: { type: 'string', required: true },
        path: { type: 'string', required: true },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        params: { type: 'object' },
        data: { type: 'object' },
        headers: { type: 'object' }
      },
      handler: async ({ endpointId, path, method = 'GET', params = {}, data = {}, headers = {} }) => {
        const endpoint = this.endpoints.get(endpointId);
        if (!endpoint) throw new Error('Endpoint not found');

        // Apply rate limiting
        if (this.rateLimiters.has(endpointId)) {
          const limiter = this.rateLimiters.get(endpointId);
          try {
            await limiter.consume(endpointId);
          } catch (e) {
            throw new Error('Rate limit exceeded');
          }
        }

        // Build request config
        const url = `${endpoint.baseUrl}${path}`;
        const requestConfig = {
          url,
          method,
          params,
          data,
          headers: {
            ...endpoint.config.auth?.headers,
            ...headers
          }
        };

        // Use circuit breaker if configured
        if (this.circuitBreakers.has(endpointId)) {
          const breaker = this.circuitBreakers.get(endpointId);
          return breaker.fire(requestConfig);
        }

        return axios(requestConfig);
      }
    });

    // GraphQL tools
    this.registerTool('registerGraphQLEndpoint', {
      description: 'Register a GraphQL endpoint',
      parameters: {
        endpointId: { type: 'string', required: true },
        url: { type: 'string', required: true },
        config: { type: 'object' }
      },
      handler: async ({ endpointId, url, config = {} }) => {
        this.endpoints.set(endpointId, {
          type: 'graphql',
          url,
          config
        });
        return { success: true };
      }
    });

    this.registerTool('queryGraphQL', {
      description: 'Execute GraphQL query',
      parameters: {
        endpointId: { type: 'string', required: true },
        query: { type: 'string', required: true },
        variables: { type: 'object' },
        headers: { type: 'object' }
      },
      handler: async ({ endpointId, query, variables = {}, headers = {} }) => {
        const endpoint = this.endpoints.get(endpointId);
        if (!endpoint) throw new Error('Endpoint not found');

        const client = new GraphQLClient(endpoint.url, {
          headers: {
            ...endpoint.config.auth?.headers,
            ...headers
          }
        });
        return client.request(query, variables);
      }
    });
  }

  async stop() {
    // Clean up circuit breakers
    for (const breaker of this.circuitBreakers.values()) {
      breaker.shutdown();
    }
    await super.stop();
  }
}

module.exports = APIGatewayServer;
