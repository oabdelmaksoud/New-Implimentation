const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { TaskProcessor } = require('../TaskProcessor');
const RedisPool = require('../RedisConfig');

const PROTO_PATH = path.join(__dirname, 'control.proto');

class ControlPlaneService {
  constructor(taskProcessor, redisPool) {
    this.taskProcessor = taskProcessor;
    this.redisPool = redisPool;
    this.server = new grpc.Server();
    this.isRunning = true;
  }

  async init() {
    // Load proto file
    const packageDefinition = protoLoader.loadSync(
      PROTO_PATH,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    );

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const controlProto = protoDescriptor.agentic.control;

    // Add service to server
    this.server.addService(controlProto.ControlPlane.service, {
      SubmitTask: this.submitTask.bind(this),
      CancelTask: this.cancelTask.bind(this),
      GetTaskStatus: this.getTaskStatus.bind(this),
      ListTasks: this.listTasks.bind(this),
      PauseSystem: this.pauseSystem.bind(this),
      ResumeSystem: this.resumeSystem.bind(this),
      GetSystemStatus: this.getSystemStatus.bind(this),
      UpdateConfig: this.updateConfig.bind(this),
      GetMetrics: this.getMetrics.bind(this),
      GetLogs: this.getLogs.bind(this),
      CheckHealth: this.checkHealth.bind(this),
      GetServerDetails: this.getServerDetails.bind(this)
    });

    // Start server
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        '0.0.0.0:50051',
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            return reject(err);
          }
          this.server.start();
          console.log(`gRPC server running on port ${port}`);
          resolve();
        }
      );
    });
  }

  async submitTask(call, callback) {
    try {
      const task = call.request;
      const redisClient = await this.redisPool.getConnection();
      
      // Store initial task state
      await redisClient.setAsync(
        `task:${task.id}`,
        JSON.stringify({
          status: 'PENDING',
          created_at: Date.now(),
          type: task.type,
          priority: task.priority
        })
      );

      // Forward to task processor via Kafka
      // (Implementation would publish to Kafka topic)
      
      callback(null, {
        id: task.id,
        status: 'PENDING',
        message: 'Task submitted successfully'
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  async cancelTask(call, callback) {
    try {
      const taskId = call.request.id;
      const redisClient = await this.redisPool.getConnection();
      
      // Update task status
      await redisClient.setAsync(
        `task:${taskId}`,
        JSON.stringify({
          status: 'CANCELLED',
          updated_at: Date.now()
        })
      );

      // (Implementation would publish cancel command to Kafka)

      callback(null, {
        success: true,
        message: `Task ${taskId} cancelled`
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  async getTaskStatus(call, callback) {
    try {
      const taskId = call.request.id;
      const redisClient = await this.redisPool.getConnection();
      const taskData = await redisClient.getAsync(`task:${taskId}`);

      if (!taskData) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `Task ${taskId} not found`
        });
      }

      const task = JSON.parse(taskData);
      callback(null, {
        id: taskId,
        status: task.status,
        created_at: task.created_at,
        updated_at: task.updated_at || 0,
        worker_id: task.worker_id || '',
        result: task.result ? Buffer.from(task.result) : null,
        error: task.error || ''
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  listTasks(call) {
    // Implementation would stream task statuses from Redis
    // Simplified example:
    const mockTasks = [
      { id: '1', status: 'COMPLETED', created_at: Date.now() - 10000 },
      { id: '2', status: 'PROCESSING', created_at: Date.now() - 5000 }
    ];

    mockTasks.forEach(task => {
      call.write({
        id: task.id,
        status: task.status,
        created_at: task.created_at
      });
    });

    call.end();
  }

  pauseSystem(call, callback) {
    this.isRunning = false;
    // (Implementation would publish pause command to Kafka)
    callback(null, {
      success: true,
      message: 'System paused'
    });
  }

  resumeSystem(call, callback) {
    this.isRunning = true;
    // (Implementation would publish resume command to Kafka)
    callback(null, {
      success: true,
      message: 'System resumed'
    });
  }

  getSystemStatus(call, callback) {
    callback(null, {
      is_running: this.isRunning,
      active_tasks: this.taskProcessor.activeTasks.size,
      queued_tasks: this.taskProcessor.taskQueue.length,
      stats: {
        processed: this.taskProcessor.stats.processed,
        failed: this.taskProcessor.stats.failed,
        retries: this.taskProcessor.stats.retries
      }
    });
  }

  updateConfig(call, callback) {
    // Simplified config update
    const updates = call.request.changes;
    Object.entries(updates).forEach(([key, value]) => {
      this.taskProcessor.config[key] = value;
    });

    callback(null, {
      success: true,
      message: 'Config updated'
    });
  }

  getMetrics(call) {
    // Implementation would stream metrics
    // Simplified example:
    const metrics = [
      { name: 'cpu', values: { usage: 0.75 }, timestamp: Date.now() },
      { name: 'memory', values: { used: 0.6 }, timestamp: Date.now() }
    ];

    metrics.forEach(metric => {
      call.write(metric);
    });

    call.end();
  }

  getLogs(call) {
    // Implementation would stream logs
    // Simplified example:
    const logs = [
      { timestamp: Date.now(), level: 'INFO', source: 'ControlPlane', message: 'Service started' },
      { timestamp: Date.now() - 1000, level: 'DEBUG', source: 'TaskProcessor', message: 'Processing task' }
    ];

    logs.forEach(log => {
      call.write(log);
    });

    call.end();
  }

  async shutdown() {
    await new Promise((resolve) => {
      this.server.tryShutdown(resolve);
    });
    console.log('gRPC server shutdown');
  }

  checkHealth(call, callback) {
    callback(null, {
      status: 'HEALTHY',
      timestamp: Date.now(),
      metrics: {
        cpu: process.cpuUsage(),
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    });
  }

  getServerDetails(call, callback) {
    callback(null, {
      serverId: process.env.SERVER_ID || 'control-plane',
      name: 'Control Plane Service',
      version: '1.0.0',
      capabilities: [
        'task-management',
        'system-control',
        'metrics',
        'logging'
      ],
      endpoints: [
        {
          protocol: 'grpc',
          address: `0.0.0.0:50051`,
          methods: Object.keys(this.server.handlers)
        }
      ]
    });
  }
}

module.exports = ControlPlaneService;
