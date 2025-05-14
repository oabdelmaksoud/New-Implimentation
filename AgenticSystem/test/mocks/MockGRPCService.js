const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { EventEmitter } = require('events');

class MockGRPCService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.latency = options.latency || 5;
    this.logger = options.logger || console;
    this.server = new grpc.Server();
    this.services = new Map();
    this.calls = new Map();
    
    // Load proto file
    const protoPath = path.join(__dirname, '../../src/grpc/control.proto');
    this.packageDefinition = protoLoader.loadSync(protoPath);
    this.proto = grpc.loadPackageDefinition(this.packageDefinition);
  }

  async start(port = 50051) {
    return new Promise((resolve) => {
      this.server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            this.logger.error('Failed to start mock gRPC server:', err);
            return;
          }
          this.server.start();
          this.logger.log(`Mock gRPC server running on port ${port}`);
          resolve(port);
        }
      );
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        this.logger.log('Mock gRPC server stopped');
        resolve();
      });
    });
  }

  registerService(serviceName, implementation) {
    const service = this.proto.manus.control[serviceName].service;
    this.server.addService(service, implementation);
    this.services.set(serviceName, implementation);
  }

  createClient(serviceName) {
    const ServiceClient = this.proto.manus.control[serviceName];
    return new ServiceClient(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );
  }

  // Test helper methods
  mockCall(serviceName, methodName, handler) {
    const key = `${serviceName}.${methodName}`;
    this.calls.set(key, handler);
  }

  clearMocks() {
    this.calls.clear();
  }

  getService(serviceName) {
    return this.services.get(serviceName);
  }

  getCallCount(serviceName, methodName) {
    const key = `${serviceName}.${methodName}`;
    return this.calls.get(key)?.callCount || 0;
  }

  // ControlPlaneService implementation
  createControlPlaneService() {
    const service = {
      registerAgent: (call, callback) => {
        this.simulateLatency(() => {
          const handler = this.calls.get('ControlPlaneService.registerAgent');
          if (handler) {
            return handler(call, callback);
          }
          callback(null, { success: true, agentId: 'mock-agent-id' });
        });
      },
      updateStatus: (call, callback) => {
        this.simulateLatency(() => {
          const handler = this.calls.get('ControlPlaneService.updateStatus');
          if (handler) {
            return handler(call, callback);
          }
          callback(null, { success: true });
        });
      },
      getTask: (call, callback) => {
        this.simulateLatency(() => {
          const handler = this.calls.get('ControlPlaneService.getTask');
          if (handler) {
            return handler(call, callback);
          }
          callback(null, { taskId: 'mock-task-id', payload: {} });
        });
      },
      submitResult: (call, callback) => {
        this.simulateLatency(() => {
          const handler = this.calls.get('ControlPlaneService.submitResult');
          if (handler) {
            return handler(call, callback);
          }
          callback(null, { success: true });
        });
      }
    };

    this.registerService('ControlPlaneService', service);
    return service;
  }

  simulateLatency(fn) {
    setTimeout(fn, Math.random() * this.latency);
  }
}

module.exports = MockGRPCService;
