/**
 * Kafka Message Bus Configuration
 */
const { Kafka } = require('kafkajs');

class KafkaConfig {
  constructor(config = {}) {
    this.kafka = new Kafka({
      clientId: config.clientId || 'agentic-system',
      brokers: config.brokers || ['localhost:9092'],
      ssl: config.ssl || false,
      sasl: config.sasl || null,
      connectionTimeout: config.connectionTimeout || 3000,
      requestTimeout: config.requestTimeout || 60000
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: config.groupId || 'agentic-group'
    });
    this.admin = this.kafka.admin();
    this.topics = new Set();
    this.logger = config.logger || console;
  }

  async connect() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      await this.admin.connect();
      this.logger.info('Kafka connections established');
      return true;
    } catch (error) {
      this.logger.error('Kafka connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      await this.admin.disconnect();
      this.logger.info('Kafka connections closed');
      return true;
    } catch (error) {
      this.logger.error('Kafka disconnection failed:', error);
      throw error;
    }
  }

  async createTopic(topic, config = {}) {
    try {
      await this.admin.createTopics({
        topics: [{
          topic,
          numPartitions: config.partitions || 3,
          replicationFactor: config.replication || 1,
          configEntries: config.config || []
        }]
      });
      this.topics.add(topic);
      this.logger.info(`Created topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Topic creation failed for ${topic}:`, error);
      throw error;
    }
  }

  async sendMessage(topic, messages) {
    try {
      await this.producer.send({
        topic,
        messages: Array.isArray(messages) ? messages : [messages]
      });
      return true;
    } catch (error) {
      this.logger.error(`Message send failed to ${topic}:`, error);
      throw error;
    }
  }

  async subscribe(topic, callback) {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          callback({
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value: message.value.toString(),
            headers: message.headers
          });
        }
      });
      this.logger.info(`Subscribed to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Subscription failed for ${topic}:`, error);
      throw error;
    }
  }
}

module.exports = KafkaConfig;
