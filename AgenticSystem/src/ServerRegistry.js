const { Kafka } = require('kafkajs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load control plane proto definition
const packageDefinition = protoLoader.loadSync(
  'src/grpc/control.proto',
  {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true}
);
const controlProto = grpc.loadPackageDefinition(packageDefinition).control;

class ServerRegistry {
  constructor(config = {}) {
    this.kafka = new Kafka({
      clientId: 'server-registry',
      brokers: config.kafkaBrokers || ['localhost:9092']
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'server-registry' });
    this.grpcClient = new controlProto.ControlPlane(
      config.grpcHost || 'localhost:50051',
      grpc.credentials.createInsecure()
    );

    this.servers = new Map();
    this.healthChecks = new Map();
    this.capabilities = new Map();
  }

  async initialize() {
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'server-registry', fromBeginning: true });

    // Start processing registration messages
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { serverId, action } = JSON.parse(message.value.toString());
        
        if (action === 'register') {
          await this.handleRegistration(serverId);
        } else if (action === 'unregister') {
          await this.handleUnregistration(serverId);
        }
      }
    });

    // Start health check loop
    setInterval(() => this.checkServerHealth(), 30000);

    // Start automatic discovery loop
    setInterval(() => this.discoverNewServers(), 60000);
    await this.discoverNewServers(); // Initial discovery
  }

  async discoverNewServers() {
    try {
      const { servers } = await new Promise((resolve, reject) => {
        this.grpcClient.DiscoverServers({}, (err, response) => {
          if (err) return reject(err);
          resolve(response);
        });
      });

      for (const server of servers) {
        if (!this.servers.has(server.id)) {
          await this.handleRegistration(server.id);
        }
      }
    } catch (error) {
      console.error('Discovery failed:', error);
    }
  }

  async handleRegistration(serverId) {
    try {
      // Get server details via gRPC
      const { server } = await new Promise((resolve, reject) => {
        this.grpcClient.GetServerDetails({ serverId }, (err, response) => {
          if (err) return reject(err);
          resolve(response);
        });
      });

      // Store server information
      this.servers.set(serverId, server);
      this.capabilities.set(serverId, server.capabilities);

      // Initialize health check
      this.healthChecks.set(serverId, {
        lastCheck: Date.now(),
        status: 'healthy'
      });

      console.log(`Registered server: ${serverId} (${server.name})`);
    } catch (error) {
      console.error(`Failed to register server ${serverId}:`, error);
    }
  }

  async handleUnregistration(serverId) {
    this.servers.delete(serverId);
    this.healthChecks.delete(serverId);
    this.capabilities.delete(serverId);
    console.log(`Unregistered server: ${serverId}`);
  }

  async checkServerHealth() {
    for (const [serverId, server] of this.servers) {
      try {
        const { status } = await new Promise((resolve, reject) => {
          this.grpcClient.CheckHealth({ serverId }, (err, response) => {
            if (err) return reject(err);
            resolve(response);
          });
        });

        this.healthChecks.set(serverId, {
          lastCheck: Date.now(),
          status
        });

        if (status !== 'healthy') {
          console.warn(`Server ${serverId} is unhealthy: ${status}`);
        }
      } catch (error) {
        console.error(`Health check failed for ${serverId}:`, error);
        this.healthChecks.set(serverId, {
          lastCheck: Date.now(),
          status: 'unreachable'
        });
      }
    }
  }

  async discoverServers(capabilities = []) {
    const matchingServers = [];
    
    for (const [serverId, server] of this.servers) {
      const { status } = this.healthChecks.get(serverId) || {};
      if (status !== 'healthy') continue;

      const serverCaps = this.capabilities.get(serverId) || [];
      if (capabilities.every(cap => serverCaps.includes(cap))) {
        matchingServers.push({
          serverId,
          ...server,
          capabilities: serverCaps
        });
      }
    }

    return matchingServers;
  }

  async stop() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
    this.grpcClient.close();
  }
}

module.exports = ServerRegistry;
