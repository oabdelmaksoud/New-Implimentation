const { MCPBaseServer } = require('@manus/mcp-core');
const { Octokit } = require('@octokit/rest');
const { createNodeMiddleware } = require('@octokit/webhooks');

class GitHubIntegrationServer extends MCPBaseServer {
  constructor(config = {}) {
    super({
      name: 'GitHubIntegration',
      version: '1.0.0',
      description: 'MCP Server for GitHub integration',
      ...config
    });

    this.octokit = new Octokit({
      auth: config.token,
      userAgent: 'Manus GitHub MCP Server'
    });

    this.webhooks = {
      middleware: null,
      events: new Map()
    };

    this.registerTools();
  }

  registerTools() {
    // Health check tool
    this.registerTool('healthCheck', {
      description: 'Check server health status',
      parameters: {},
      handler: async () => {
        try {
          // Test API connectivity
          await this.octokit.rest.meta.get();
          return {
            status: 'healthy',
            timestamp: Date.now(),
            metrics: {
              uptime: process.uptime(),
              memory: process.memoryUsage()
            }
          };
        } catch (error) {
          return {
            status: 'unhealthy',
            error: error.message,
            timestamp: Date.now()
          };
        }
      }
    });

    this.registerTool('getRepo', {
      description: 'Get repository information',
      parameters: {
        owner: { type: 'string', required: true },
        repo: { type: 'string', required: true }
      },
      handler: async ({ owner, repo }) => {
        return this.octokit.repos.get({ owner, repo });
      }
    });

    this.registerTool('createIssue', {
      description: 'Create a new GitHub issue',
      parameters: {
        owner: { type: 'string', required: true },
        repo: { type: 'string', required: true },
        title: { type: 'string', required: true },
        body: { type: 'string' }
      },
      handler: async ({ owner, repo, title, body }) => {
        return this.octokit.issues.create({ owner, repo, title, body });
      }
    });

    this.registerWebhook('issues', {
      description: 'Handle GitHub issue events',
      events: ['opened', 'closed', 'reopened']
    });
  }

  registerWebhook(event, config) {
    if (!this.webhooks.events.has(event)) {
      this.webhooks.events.set(event, []);
    }
    this.webhooks.events.get(event).push(config);
  }

  async start() {
    await super.start();
    
    if (this.config.webhookSecret) {
      this.webhooks.middleware = createNodeMiddleware(this.handleWebhook.bind(this), {
        path: '/webhooks/github',
        secret: this.config.webhookSecret
      });
      this.app.use(this.webhooks.middleware);
    }

    this.logger.log(`GitHub MCP Server running on port ${this.port}`);
  }

  async handleWebhook(event, payload) {
    const { action } = payload;
    const handlers = this.webhooks.events.get(event) || [];
    
    for (const handler of handlers) {
      if (handler.events.includes(action)) {
        this.emit(event, payload);
        break;
      }
    }
  }
}

module.exports = GitHubIntegrationServer;
