const { MCPBaseServer } = require('@manus/mcp-core');
const { Kafka } = require('kafkajs');
const uuid = require('uuid');

class TaskQueueServer extends MCPBaseServer {
  constructor(config = {}) {
    super({
      name: 'TaskQueue',
      version: '1.0.0',
      description: 'MCP Server for distributed task processing',
      ...config
    });

    this.kafka = new Kafka({
      clientId: 'task-queue-server',
      brokers: config.kafkaBrokers || ['localhost:9092']
    });

    this.producer = this.kafka.producer();
    this.consumers = new Map();
    this.taskHandlers = new Map();
    this.registerTools();
  }

  async initialize() {
    await this.producer.connect();
    await super.initialize();
  }

  registerTools() {
    // Health check tool
    this.registerTool('healthCheck', {
      description: 'Check queue server health status',
      parameters: {},
      handler: async () => {
        const results = {
          status: 'healthy',
          timestamp: Date.now(),
          components: [],
          metrics: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            activeQueues: this.consumers.size,
            registeredHandlers: this.taskHandlers.size
          }
        };

        // Test producer connection
        try {
          await this.producer.send({
            topic: 'health-check',
            messages: [{ value: 'ping' }]
          });
          results.components.push({
            type: 'kafka-producer',
            status: 'healthy'
          });
        } catch (error) {
          results.status = 'degraded';
          results.components.push({
            type: 'kafka-producer',
            status: 'unhealthy',
            error: error.message
          });
        }

        // Test consumer connections
        for (const [queueName, consumer] of this.consumers) {
          try {
            await consumer.describeGroup();
            results.components.push({
              queue: queueName,
              type: 'kafka-consumer',
              status: 'healthy'
            });
          } catch (error) {
            results.status = 'degraded';
            results.components.push({
              queue: queueName,
              type: 'kafka-consumer',
              status: 'unhealthy',
              error: error.message
            });
          }
        }

        return results;
      }
    });

    // Task management tools
    this.registerTool('createQueue', {
      description: 'Create a new task queue',
      parameters: {
        queueName: { type: 'string', required: true },
        concurrency: { type: 'number', default: 1 }
      },
      handler: async ({ queueName, concurrency = 1 }) => {
        const consumer = this.kafka.consumer({ groupId: `task-queue-${queueName}` });
        await consumer.connect();
        await consumer.subscribe({ topic: queueName, fromBeginning: false });

        this.consumers.set(queueName, consumer);

        // Start processing messages
        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            const task = JSON.parse(message.value.toString());
            const handler = this.taskHandlers.get(topic);
            if (handler) {
              try {
                await handler(task);
              } catch (error) {
                // Handle task failure (could send to DLQ)
                console.error(`Task failed in queue ${topic}:`, error);
              }
            }
          }
        });

        return { success: true };
      }
    });

    this.registerTool('registerTaskHandler', {
      description: 'Register a handler for a task queue',
      parameters: {
        queueName: { type: 'string', required: true },
        handlerId: { type: 'string', required: true }
      },
      handler: async ({ queueName, handlerId }) => {
        // In a real implementation, this would store the handler function
        this.taskHandlers.set(queueName, handlerId);
        return { success: true };
      }
    });

    this.registerTool('enqueueTask', {
      description: 'Add a task to a queue',
      parameters: {
        queueName: { type: 'string', required: true },
        task: { type: 'object', required: true },
        priority: { type: 'number', default: 0 }
      },
      handler: async ({ queueName, task, priority = 0 }) => {
        const taskId = uuid.v4();
        const timestamp = Date.now();
        
        await this.producer.send({
          topic: queueName,
          messages: [{
            key: `${priority}-${timestamp}`,
            value: JSON.stringify({
              ...task,
              taskId,
              enqueuedAt: timestamp,
              priority
            })
          }]
        });

        return { taskId };
      }
    });

    this.registerTool('createDependentTask', {
      description: 'Create a task with dependencies',
      parameters: {
        queueName: { type: 'string', required: true },
        task: { type: 'object', required: true },
        dependsOn: { type: 'array', items: { type: 'string' } }
      },
      handler: async ({ queueName, task, dependsOn = [] }) => {
        // In a real implementation, this would track task dependencies
        // and only execute when dependencies are met
        return this.enqueueTask({ queueName, task });
      }
    });

    // Monitoring tools
    this.registerTool('getQueueStats', {
      description: 'Get statistics for a task queue',
      parameters: {
        queueName: { type: 'string', required: true }
      },
      handler: async ({ queueName }) => {
        // In a real implementation, this would fetch actual stats
        return {
          queueName,
          pendingTasks: 0,
          activeConsumers: this.consumers.has(queueName) ? 1 : 0,
          processedTasks: 0,
          failedTasks: 0
        };
      }
    });
  }

  async stop() {
    // Disconnect all consumers
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
    // Disconnect producer
    await this.producer.disconnect();
    await super.stop();
  }
}

module.exports = TaskQueueServer;
