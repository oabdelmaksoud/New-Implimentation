const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ToolIntegrationAPI } = require('../../src/mcp-servers/ToolIntegrationAPI');
const { PermissionManager } = require('../../src/mcp-servers/PermissionConfig');

// Mock ServerRegistry
class MockServerRegistry {
  constructor() {
    this.servers = new Map();
  }

  async getServer(name) {
    return this.servers.get(name) || null;
  }

  addServer(name, server) {
    this.servers.set(name, server);
  }
}

describe('ToolIntegrationAPI', () => {
  let app;
  let serverRegistry;
  let validToken;

  beforeAll(() => {
    // Create test JWT token
    validToken = jwt.sign(
      { 
        sub: 'test-user',
        roles: ['developer'],
        permissions: ['execute'],
        iss: 'mcp-control-plane'
      },
      'test-secret',
      { algorithm: 'HS256' }
    );

    // Setup test server
    serverRegistry = new MockServerRegistry();
    const toolIntegration = new ToolIntegrationAPI(serverRegistry);
    app = express();
    app.use(express.json());
    app.use(toolIntegration.getRouter());
  });

  describe('POST /execute', () => {
    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .post('/execute')
        .send({
          serverName: 'test-server',
          toolName: 'test-tool',
          args: {}
        });
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/execute')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          serverName: 'test-server',
          toolName: 'test-tool',
          args: {}
        });
      expect(response.status).toBe(401);
    });

    it('should return 403 for unknown server due to missing permissions', async () => {
      // Add mock server that returns null
      serverRegistry.getServer = jest.fn().mockResolvedValue(null);
      
      // Create token with server-specific permission
      const serverToken = jwt.sign(
        { 
          sub: 'test-user',
          roles: ['developer'],
          permissions: ['execute:test-server'],
          iss: 'mcp-control-plane'
        },
        'test-secret',
        { algorithm: 'HS256' }
      );
      
      const response = await request(app)
        .post('/execute')
        .set('Authorization', `Bearer ${serverToken}`)
        .send({
          serverName: 'unknown-server',
          toolName: 'test-tool',
          args: {}
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Invalid resource request/);
    });

    it('should execute tool successfully with proper permissions', async () => {
      // Update token with all required permissions
      const serverToken = jwt.sign(
        { 
          sub: 'test-user',
          roles: ['developer'],
          permissions: ['execute', 'execute:test-server', 'access:test-server'],
          iss: 'mcp-control-plane'
        },
        'test-secret',
        { algorithm: 'HS256' }
      );
      // Add mock server with proper registration
      const mockServer = {
        executeTool: jest.fn().mockResolvedValue({ result: 'success' }),
        accessResource: jest.fn().mockResolvedValue({ data: 'resource-data' })
      };
      serverRegistry.getServer = jest.fn().mockResolvedValue(mockServer);

      const response = await request(app)
        .post('/execute')
        .set('Authorization', `Bearer ${serverToken}`)
        .send({
          serverName: 'test-server',
          toolName: 'test-tool',
          args: { param: 'value' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: 'success' });
      expect(mockServer.executeTool).toHaveBeenCalledWith(
        'test-tool',
        { param: 'value' }
      );
    });
  });

  describe('GET /resource', () => {
    it('should access resource successfully with proper permissions', async () => {
      // Update token with resource-specific permission and correct issuer
      const resourceToken = jwt.sign(
        { 
          sub: 'test-user',
          roles: ['developer'],
          permissions: ['access:test-server'],
          iss: 'mcp-control-plane'
        },
        'test-secret',
        { algorithm: 'HS256' }
      );

      // Add mock server
      const mockServer = {
        accessResource: jest.fn().mockResolvedValue({ data: 'resource-data' })
      };
      serverRegistry.addServer('test-server', mockServer);

      const response = await request(app)
        .get('/resource')
        .set('Authorization', `Bearer ${resourceToken}`)
        .query({
          serverName: 'test-server',
          resourceUri: 'test/resource'
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
      expect(mockServer.accessResource).toHaveBeenCalledWith('test/resource');
    });

    it('should return 403 without resource permissions', async () => {
      // Add mock server
      const mockServer = {
        accessResource: jest.fn()
      };
      serverRegistry.addServer('test-server', mockServer);

      // Create token with resource-specific permission
      const resourceToken = jwt.sign(
        { 
          sub: 'test-user',
          roles: ['developer'],
          permissions: ['access:test-server'],
          iss: 'mcp-control-plane'
        },
        'test-secret',
        { algorithm: 'HS256' }
      );
      
      const response = await request(app)
        .get('/resource')
        .set('Authorization', `Bearer ${resourceToken}`)
        .query({
          serverName: 'test-server',
          resourceUri: 'test/resource'
        });

      expect(response.status).toBe(403);
      expect(mockServer.accessResource).not.toHaveBeenCalled();
    });
  });
});
