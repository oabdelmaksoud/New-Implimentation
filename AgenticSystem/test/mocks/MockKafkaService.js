const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class MockKafkaService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.topics = new Map();
    this.consumerGroups = new Map();
    this.latency = options.latency || 10;
    this.logger = options.logger || console;
    this.messageRetention = options.messageRetention || 1000;
  }

  async connect() {
    return Promise.resolve(this);
  }

  async producer() {
    return {
      connect: async () => this,
      disconnect: async () => {},
      send: async (payload) => this.produce(payload)
    };
  }

  async consumer(groupConfig) {
    const groupId = groupConfig.groupId;
    if (!this.consumerGroups.has(groupId)) {
      this.consumerGroups.set(groupId, {
        offsets: new Map(),
        subscriptions: new Set()
      });
    }

    return {
      connect: async () => this,
      disconnect: async () => {},
      subscribe: async (topicConfig) => {
        topicConfig.topics.forEach(topic => {
          this.consumerGroups.get(groupId).subscriptions.add(topic);
        });
      },
      run: async (config) => {
        this.consumerConfig = config;
        return this;
      },
      commitOffsets: async (offsets) => {
        offsets.forEach(({ topic, partition, offset }) => {
          const group = this.consumerGroups.get(groupId);
          group.offsets.set(`${topic}:${partition}`, offset);
        });
      }
    };
  }

  async produce(payload) {
    const { topic, messages } = payload;
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }

    const topicQueue = this.topics.get(topic);
    messages.forEach(message => {
      const msg = {
        ...message,
        offset: topicQueue.length,
        timestamp: Date.now(),
        key: message.key || uuidv4()
      };
      topicQueue.push(msg);
      this.emit('message', { topic, message: msg });
    });

    // Clean up old messages
    if (topicQueue.length > this.messageRetention) {
      topicQueue.splice(0, topicQueue.length - this.messageRetention);
    }
  }

  async *consumeMessages(groupId, topic) {
    const group = this.consumerGroups.get(groupId);
    if (!group || !group.subscriptions.has(topic)) {
      throw new Error(`Consumer group ${groupId} not subscribed to ${topic}`);
    }

    const topicQueue = this.topics.get(topic) || [];
    let offset = group.offsets.get(`${topic}:0`) || 0;

    while (true) {
      if (offset < topicQueue.length) {
        const message = topicQueue[offset];
        yield {
          topic,
          partition: 0,
          message: {
            ...message,
            offset: offset
          }
        };
        offset++;
        group.offsets.set(`${topic}:0`, offset);
      } else {
        await new Promise(resolve => setTimeout(resolve, this.latency));
      }
    }
  }

  // Test helper methods
  clearTopic(topic) {
    if (this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
  }

  clearAll() {
    this.topics.clear();
    this.consumerGroups.clear();
  }

  getTopicState(topic) {
    return this.topics.get(topic) || [];
  }

  getConsumerGroupState(groupId) {
    return this.consumerGroups.get(groupId) || { offsets: new Map(), subscriptions: new Set() };
  }
}

module.exports = MockKafkaService;
