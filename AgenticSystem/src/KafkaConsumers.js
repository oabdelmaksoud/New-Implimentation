/**
 * Kafka Consumer Groups Configuration
 */
const { KafkaTopics } = require('./KafkaTopics');

module.exports = {
  // System consumers
  SYSTEM_MONITOR: {
    groupId: 'system-monitor',
    topics: [
      KafkaTopics.SYSTEM_CONTROL.name,
      KafkaTopics.METRICS.name,
      KafkaTopics.ALERTS.name
    ],
    options: {
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576 // 1MB
    }
  },

  // Agent control consumers
  AGENT_CONTROLLER: {
    groupId: 'agent-controller',
    topics: [
      KafkaTopics.AGENT_COMMANDS.name,
      KafkaTopics.AGENT_EVENTS.name
    ],
    options: {
      sessionTimeout: 45000,
      rebalanceTimeout: 90000,
      heartbeatInterval: 5000,
      maxBytesPerPartition: 524288 // 512KB
    }
  },

  // Task processor consumers
  TASK_PROCESSOR: {
    groupId: 'task-processor',
    topics: [
      KafkaTopics.TASK_REQUESTS.name,
      KafkaTopics.TASK_RESULTS.name
    ],
    options: {
      sessionTimeout: 60000,
      rebalanceTimeout: 120000,
      heartbeatInterval: 10000,
      maxBytesPerPartition: 2097152 // 2MB
    }
  },

  // Data pipeline consumers
  DATA_PIPELINE: {
    groupId: 'data-pipeline',
    topics: [
      KafkaTopics.DATA_INBOUND.name,
      KafkaTopics.DATA_PROCESSED.name
    ],
    options: {
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 4194304 // 4MB
    }
  }
};
