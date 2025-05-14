/**
 * Standard Kafka Topics Configuration
 */
module.exports = {
  // System control topics
  SYSTEM_CONTROL: {
    name: 'system.control',
    partitions: 3,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '604800000' } // 7 days
    ]
  },

  // Agent communication topics
  AGENT_COMMANDS: {
    name: 'agent.commands',
    partitions: 6,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '86400000' } // 1 day
    ]
  },

  AGENT_EVENTS: {
    name: 'agent.events',
    partitions: 6, 
    replication: 2,
    config: [
      { name: 'retention.ms', value: '259200000' } // 3 days
    ]
  },

  // Task management topics
  TASK_REQUESTS: {
    name: 'task.requests',
    partitions: 12,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '86400000' } // 1 day
    ]
  },

  TASK_RESULTS: {
    name: 'task.results',
    partitions: 12,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '604800000' } // 7 days
    ]
  },

  // Monitoring topics
  METRICS: {
    name: 'system.metrics',
    partitions: 3,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '259200000' } // 3 days
    ]
  },

  ALERTS: {
    name: 'system.alerts',
    partitions: 3,
    replication: 3,
    config: [
      { name: 'retention.ms', value: '-1' } // infinite
    ]
  },

  // Data pipeline topics
  DATA_INBOUND: {
    name: 'data.inbound',
    partitions: 24,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '86400000' } // 1 day
    ]
  },

  DATA_PROCESSED: {
    name: 'data.processed',
    partitions: 24,
    replication: 2,
    config: [
      { name: 'retention.ms', value: '604800000' } // 7 days
    ]
  }
};
