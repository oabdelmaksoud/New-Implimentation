const { MCPBaseServer } = require('./MCPBaseServer');

class LocalServerTemplate extends MCPBaseServer {
  constructor(config = {}) {
    super({
      name: 'local-template',
      version: '1.0.0',
      description: 'Template for local MCP servers',
      ...config
    });

    // Register capabilities
    this.registerCapability('local-processing');
    this.registerCapability('data-transformation');

    // Initialize services
    this.services = {
      processData: this.processData.bind(this),
      transformData: this.transformData.bind(this)
    };
  }

  async start() {
    await super.start();
    this.log('Local template server started');
  }

  async processData(input) {
    return { 
      status: 'processed',
      result: `Processed: ${JSON.stringify(input)}` 
    };
  }

  async transformData(input, options = {}) {
    return {
      status: 'transformed',
      result: options.reverse ? 
        input.split('').reverse().join('') : 
        input.toUpperCase()
    };
  }
}

module.exports = { LocalServerTemplate };
