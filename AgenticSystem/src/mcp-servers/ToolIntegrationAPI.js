const express = require('express');
const { authenticate } = require('./authMiddleware');
const { validateToolRequest } = require('./validation');

class ToolIntegrationAPI {
  constructor(serverRegistry) {
    this.router = express.Router();
    this.serverRegistry = serverRegistry;
    this.setupRoutes();
  }

  setupRoutes() {
    // Authentication middleware for all routes
    this.router.use(authenticate);

    // Tool execution endpoint
    this.router.post('/execute', validateToolRequest, async (req, res) => {
      try {
        const { serverName, toolName, args } = req.body;
        
        // Check permissions
        if (!req.user.permissions.includes(`execute:${serverName}`)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Get server from registry
        const server = await this.serverRegistry.getServer(serverName);
        if (!server) {
          return res.status(404).json({ error: 'Server not found' });
        }

        // Execute tool
        const result = await server.executeTool(toolName, args);
        res.json(result);
      } catch (error) {
        res.status(500).json({ 
          error: 'Tool execution failed',
          details: error.message 
        });
      }
    });

    // Resource access endpoint
    this.router.get('/resource', validateToolRequest, async (req, res) => {
      try {
        const { serverName, resourceUri } = req.query;
        
        // Check permissions
        if (!req.user.permissions.includes(`access:${serverName}`)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Get server from registry
        const server = await this.serverRegistry.getServer(serverName);
        if (!server) {
          return res.status(404).json({ error: 'Server not found' });
        }

        // Access resource
        const resource = await server.accessResource(resourceUri);
        res.json(resource);
      } catch (error) {
        res.status(500).json({ 
          error: 'Resource access failed',
          details: error.message 
        });
      }
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = { ToolIntegrationAPI };
