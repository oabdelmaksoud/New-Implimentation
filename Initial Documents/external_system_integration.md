# External System Integration

## Overview

The External System Integration component is a critical part of the Integration and Deployment phase. It enables the system to connect with external services, APIs, and systems to extend functionality and interoperate with the broader ecosystem. This document outlines the detailed implementation plan for the External System Integration system.

## Objectives

- Implement standardized integration interfaces
- Create secure authentication mechanisms
- Develop data transformation and mapping
- Implement robust error handling and recovery

## Tasks

1. **Integration Framework**
   - Implement integration gateway
   - Create adapter pattern implementation
   - Develop service registry
   - Implement message transformation

2. **Authentication and Security**
   - Create OAuth 2.0 implementation
   - Implement API key management
   - Develop JWT handling
   - Create credential vault

3. **Data Transformation**
   - Implement schema mapping
   - Create data validation
   - Develop transformation pipelines
   - Implement data enrichment

4. **Error Handling**
   - Create retry mechanisms
   - Implement circuit breakers
   - Develop fallback strategies
   - Create error logging and monitoring

## Micro-Level Implementation Details

### Integration Structure

```typescript
// Integration Definition
interface IntegrationDefinition {
  id: string;                     // Unique integration ID
  name: string;                   // Integration name
  description: string;            // Integration description
  type: IntegrationType;          // Integration type
  version: string;                // Integration version
  provider: string;               // Integration provider
  endpoints: Endpoint[];          // Integration endpoints
  authentication: Authentication; // Authentication details
  configuration: any;             // Integration configuration
  status: IntegrationStatus;      // Integration status
  metadata: Map<string, any>;     // Additional metadata
}

// Integration Type
enum IntegrationType {
  REST_API = 'rest_api',
  GRAPHQL = 'graphql',
  SOAP = 'soap',
  WEBHOOK = 'webhook',
  EVENT_STREAM = 'event_stream',
  MESSAGE_QUEUE = 'message_queue',
  DATABASE = 'database',
  FILE_TRANSFER = 'file_transfer',
  CUSTOM = 'custom'
}

// Endpoint
interface Endpoint {
  id: string;                     // Unique endpoint ID
  name: string;                   // Endpoint name
  description: string;            // Endpoint description
  url: string;                    // Endpoint URL
  method: HttpMethod;             // HTTP method
  headers: Map<string, string>;   // HTTP headers
  queryParams: Map<string, string>; // Query parameters
  requestSchema?: any;            // Request schema
  responseSchema?: any;           // Response schema
  timeout: number;                // Timeout in milliseconds
  retryConfig?: RetryConfig;      // Retry configuration
  circuitBreakerConfig?: CircuitBreakerConfig; // Circuit breaker configuration
  rateLimit?: RateLimit;          // Rate limit
  metadata: Map<string, any>;     // Additional metadata
}

// HTTP Method
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

// Authentication
interface Authentication {
  type: AuthenticationType;       // Authentication type
  config: any;                    // Authentication configuration
}

// Authentication Type
enum AuthenticationType {
  NONE = 'none',
  API_KEY = 'api_key',
  BASIC = 'basic',
  OAUTH2 = 'oauth2',
  JWT = 'jwt',
  CUSTOM = 'custom'
}

// Retry Config
interface RetryConfig {
  maxRetries: number;             // Maximum retry attempts
  initialDelay: number;           // Initial delay in milliseconds
  maxDelay: number;               // Maximum delay in milliseconds
  backoffMultiplier: number;      // Backoff multiplier
  retryableStatusCodes: number[]; // Retryable HTTP status codes
}

// Circuit Breaker Config
interface CircuitBreakerConfig {
  failureThreshold: number;       // Failure threshold
  resetTimeout: number;           // Reset timeout in milliseconds
  requestVolumeThreshold: number; // Request volume threshold
  errorThresholdPercentage: number; // Error threshold percentage
}

// Rate Limit
interface RateLimit {
  limit: number;                  // Rate limit
  period: number;                 // Period in milliseconds
  strategy: RateLimitStrategy;    // Rate limit strategy
}

// Rate Limit Strategy
enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket'
}

// Integration Status
enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// Integration Instance
interface IntegrationInstance {
  id: string;                     // Unique instance ID
  definitionId: string;           // Integration definition ID
  name: string;                   // Instance name
  description: string;            // Instance description
  configuration: any;             // Instance configuration
  credentials: Credential[];      // Instance credentials
  status: InstanceStatus;         // Instance status
  healthCheck: HealthCheck;       // Health check
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Credential
interface Credential {
  id: string;                     // Unique credential ID
  name: string;                   // Credential name
  type: CredentialType;           // Credential type
  value: any;                     // Credential value
  expiresAt?: Date;               // Expiration timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Credential Type
enum CredentialType {
  API_KEY = 'api_key',
  USERNAME_PASSWORD = 'username_password',
  OAUTH_TOKEN = 'oauth_token',
  JWT_TOKEN = 'jwt_token',
  CERTIFICATE = 'certificate',
  CUSTOM = 'custom'
}

// Instance Status
enum InstanceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// Health Check
interface HealthCheck {
  endpoint: string;               // Health check endpoint
  interval: number;               // Check interval in seconds
  timeout: number;                // Timeout in milliseconds
  unhealthyThreshold: number;     // Unhealthy threshold
  healthyThreshold: number;       // Healthy threshold
  status: HealthStatus;           // Health status
  lastCheck?: Date;               // Last check timestamp
  nextCheck?: Date;               // Next check timestamp
}

// Health Status
enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}
```

### Data Transformation Structure

```typescript
// Schema Mapping
interface SchemaMapping {
  id: string;                     // Unique mapping ID
  name: string;                   // Mapping name
  description: string;            // Mapping description
  sourceSchema: any;              // Source schema
  targetSchema: any;              // Target schema
  mappingRules: MappingRule[];    // Mapping rules
  version: string;                // Mapping version
  metadata: Map<string, any>;     // Additional metadata
}

// Mapping Rule
interface MappingRule {
  id: string;                     // Unique rule ID
  sourcePath: string;             // Source path
  targetPath: string;             // Target path
  transformation?: Transformation; // Transformation
  condition?: Condition;          // Condition
  defaultValue?: any;             // Default value
  required: boolean;              // Whether mapping is required
  metadata: Map<string, any>;     // Additional metadata
}

// Transformation
interface Transformation {
  type: TransformationType;       // Transformation type
  config: any;                    // Transformation configuration
}

// Transformation Type
enum TransformationType {
  NONE = 'none',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ARRAY = 'array',
  OBJECT = 'object',
  CUSTOM = 'custom'
}

// Condition
interface Condition {
  type: ConditionType;            // Condition type
  field: string;                  // Field to check
  operator: ConditionOperator;    // Condition operator
  value: any;                     // Value to compare
}

// Condition Type
enum ConditionType {
  FIELD = 'field',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
  CUSTOM = 'custom'
}

// Condition Operator
enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUALS = 'greater_than_or_equals',
  LESS_THAN_OR_EQUALS = 'less_than_or_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX = 'regex'
}

// Data Validator
interface DataValidator {
  id: string;                     // Unique validator ID
  name: string;                   // Validator name
  description: string;            // Validator description
  schema: any;                    // Validation schema
  rules: ValidationRule[];        // Validation rules
  version: string;                // Validator version
  metadata: Map<string, any>;     // Additional metadata
}

// Validation Rule
interface ValidationRule {
  id: string;                     // Unique rule ID
  field: string;                  // Field to validate
  type: ValidationType;           // Validation type
  config: any;                    // Validation configuration
  message: string;                // Error message
  severity: ValidationSeverity;   // Validation severity
  metadata: Map<string, any>;     // Additional metadata
}

// Validation Type
enum ValidationType {
  REQUIRED = 'required',
  TYPE = 'type',
  FORMAT = 'format',
  RANGE = 'range',
  LENGTH = 'length',
  PATTERN = 'pattern',
  ENUM = 'enum',
  CUSTOM = 'custom'
}

// Validation Severity
enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// Transformation Pipeline
interface TransformationPipeline {
  id: string;                     // Unique pipeline ID
  name: string;                   // Pipeline name
  description: string;            // Pipeline description
  steps: PipelineStep[];          // Pipeline steps
  version: string;                // Pipeline version
  metadata: Map<string, any>;     // Additional metadata
}

// Pipeline Step
interface PipelineStep {
  id: string;                     // Unique step ID
  name: string;                   // Step name
  type: PipelineStepType;         // Step type
  config: any;                    // Step configuration
  order: number;                  // Step order
  condition?: Condition;          // Condition
  errorHandler?: ErrorHandler;    // Error handler
  metadata: Map<string, any>;     // Additional metadata
}

// Pipeline Step Type
enum PipelineStepType {
  MAPPING = 'mapping',
  VALIDATION = 'validation',
  TRANSFORMATION = 'transformation',
  ENRICHMENT = 'enrichment',
  FILTERING = 'filtering',
  CUSTOM = 'custom'
}

// Error Handler
interface ErrorHandler {
  type: ErrorHandlerType;         // Error handler type
  config: any;                    // Error handler configuration
}

// Error Handler Type
enum ErrorHandlerType {
  IGNORE = 'ignore',
  RETRY = 'retry',
  FALLBACK = 'fallback',
  THROW = 'throw',
  CUSTOM = 'custom'
}
```

### Integration System

```typescript
// Integration System
class IntegrationSystem {
  private db: Database;
  private definitions: Map<string, IntegrationDefinition>;
  private instances: Map<string, IntegrationInstance>;
  private schemaMappings: Map<string, SchemaMapping>;
  private dataValidators: Map<string, DataValidator>;
  private transformationPipelines: Map<string, TransformationPipeline>;
  private credentialVault: CredentialVault;
  private httpClient: HttpClient;
  private healthChecker: HealthChecker;
  
  constructor(db: Database) {
    this.db = db;
    this.definitions = new Map();
    this.instances = new Map();
    this.schemaMappings = new Map();
    this.dataValidators = new Map();
    this.transformationPipelines = new Map();
    this.credentialVault = new CredentialVault();
    this.httpClient = new HttpClient();
    this.healthChecker = new HealthChecker();
  }
  
  async initialize(): Promise<void> {
    // Initialize credential vault
    await this.credentialVault.initialize();
    
    // Load integration definitions from database
    const definitionData = await this.db.integrationDefinitions.findAll();
    for (const data of definitionData) {
      const definition: IntegrationDefinition = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        type: data.type as IntegrationType,
        version: data.version,
        provider: data.provider,
        endpoints: data.endpoints,
        authentication: data.authentication,
        configuration: data.configuration,
        status: data.status as IntegrationStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.definitions.set(definition.id, definition);
    }
    
    // Load integration instances from database
    const instanceData = await this.db.integrationInstances.findAll();
    for (const data of instanceData) {
      const instance: IntegrationInstance = {
        id: data.uuid,
        definitionId: data.definition_id,
        name: data.name,
        description: data.description,
        configuration: data.configuration,
        credentials: data.credentials,
        status: data.status as InstanceStatus,
        healthCheck: data.health_check,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.instances.set(instance.id, instance);
    }
    
    // Load schema mappings from database
    const mappingData = await this.db.schemaMappings.findAll();
    for (const data of mappingData) {
      const mapping: SchemaMapping = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        sourceSchema: data.source_schema,
        targetSchema: data.target_schema,
        mappingRules: data.mapping_rules,
        version: data.version,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.schemaMappings.set(mapping.id, mapping);
    }
    
    // Load data validators from database
    const validatorData = await this.db.dataValidators.findAll();
    for (const data of validatorData) {
      const validator: DataValidator = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        schema: data.schema,
        rules: data.rules,
        version: data.version,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.dataValidators.set(validator.id, validator);
    }
    
    // Load transformation pipelines from database
    const pipelineData = await this.db.transformationPipelines.findAll();
    for (const data of pipelineData) {
      const pipeline: TransformationPipeline = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        steps: data.steps,
        version: data.version,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.transformationPipelines.set(pipeline.id, pipeline);
    }
    
    // Start health checker
    this.healthChecker.start();
  }
  
  // Integration Definition Methods
  
  async createIntegrationDefinition(definitionData: Omit<IntegrationDefinition, 'id'>): Promise<string> {
    // Generate definition ID
    const definitionId = uuidv4();
    
    // Create definition object
    const definition: IntegrationDefinition = {
      id: definitionId,
      ...definitionData,
      metadata: definitionData.metadata || new Map()
    };
    
    // Validate definition
    this.validateIntegrationDefinition(definition);
    
    // Add to memory
    this.definitions.set(definitionId, definition);
    
    // Store in database
    await this.db.integrationDefinitions.create({
      uuid: definitionId,
      name: definition.name,
      description: definition.description,
      type: definition.type,
      version: definition.version,
      provider: definition.provider,
      endpoints: definition.endpoints,
      authentication: definition.authentication,
      configuration: definition.configuration,
      status: definition.status,
      metadata: Object.fromEntries(definition.metadata)
    });
    
    return definitionId;
  }
  
  async updateIntegrationDefinition(definitionId: string, updates: Partial<IntegrationDefinition>): Promise<void> {
    // Get definition
    const definition = await this.getIntegrationDefinition(definitionId);
    
    // Apply updates
    const updatedDefinition: IntegrationDefinition = {
      ...definition,
      ...updates,
      id: definition.id, // Ensure ID doesn't change
      metadata: new Map([...definition.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated definition
    this.validateIntegrationDefinition(updatedDefinition);
    
    // Update in memory
    this.definitions.set(definitionId, updatedDefinition);
    
    // Update in database
    await this.db.integrationDefinitions.update(definitionId, {
      name: updatedDefinition.name,
      description: updatedDefinition.description,
      type: updatedDefinition.type,
      version: updatedDefinition.version,
      provider: updatedDefinition.provider,
      endpoints: updatedDefinition.endpoints,
      authentication: updatedDefinition.authentication,
      configuration: updatedDefinition.configuration,
      status: updatedDefinition.status,
      metadata: Object.fromEntries(updatedDefinition.metadata)
    });
  }
  
  // Integration Instance Methods
  
  async createIntegrationInstance(instanceData: Omit<IntegrationInstance, 'id' | 'status' | 'healthCheck' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Generate instance ID
    const instanceId = uuidv4();
    
    // Get definition
    const definition = await this.getIntegrationDefinition(instanceData.definitionId);
    
    // Create health check
    const healthCheck: HealthCheck = {
      endpoint: this.getHealthCheckEndpoint(definition),
      interval: 60, // Default to 60 seconds
      timeout: 5000, // Default to 5 seconds
      unhealthyThreshold: 3, // Default to 3 failures
      healthyThreshold: 2, // Default to 2 successes
      status: HealthStatus.UNKNOWN
    };
    
    // Create instance object
    const instance: IntegrationInstance = {
      id: instanceId,
      ...instanceData,
      status: InstanceStatus.INACTIVE,
      healthCheck,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: instanceData.metadata || new Map()
    };
    
    // Validate instance
    this.validateIntegrationInstance(instance);
    
    // Add to memory
    this.instances.set(instanceId, instance);
    
    // Store in database
    await this.db.integrationInstances.create({
      uuid: instanceId,
      definition_id: instance.definitionId,
      name: instance.name,
      description: instance.description,
      configuration: instance.configuration,
      credentials: instance.credentials,
      status: instance.status,
      health_check: instance.healthCheck,
      created_at: instance.createdAt,
      updated_at: instance.updatedAt,
      metadata: Object.fromEntries(instance.metadata)
    });
    
    return instanceId;
  }
  
  async activateIntegrationInstance(instanceId: string): Promise<void> {
    // Get instance
    const instance = await this.getIntegrationInstance(instanceId);
    
    // Check if instance can be activated
    if (instance.status === InstanceStatus.ACTIVE) {
      return; // Already active
    }
    
    // Test connection
    await this.testIntegrationConnection(instanceId);
    
    // Update status
    instance.status = InstanceStatus.ACTIVE;
    instance.updatedAt = new Date();
    
    // Update in memory
    this.instances.set(instanceId, instance);
    
    // Update in database
    await this.db.integrationInstances.update(instanceId, {
      status: instance.status,
      updated_at: instance.updatedAt
    });
    
    // Register with health checker
    this.healthChecker.registerInstance(instance);
  }
  
  async executeIntegrationRequest(instanceId: string, endpointId: string, requestData?: any): Promise<any> {
    // Get instance
    const instance = await this.getIntegrationInstance(instanceId);
    
    // Check if instance is active
    if (instance.status !== InstanceStatus.ACTIVE) {
      throw new Error(`Integration instance ${instanceId} is not active`);
    }
    
    // Get definition
    const definition = await this.getIntegrationDefinition(instance.definitionId);
    
    // Find endpoint
    const endpoint = definition.endpoints.find(e => e.id === endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found in integration definition ${definition.id}`);
    }
    
    // Get credentials
    const credentials = await this.getCredentials(instance);
    
    // Prepare request
    const request = await this.prepareRequest(endpoint, instance.configuration, credentials, requestData);
    
    // Execute request
    const response = await this.executeRequest(request, endpoint);
    
    // Process response
    return this.processResponse(response, endpoint);
  }
  
  // Schema Mapping Methods
  
  async createSchemaMapping(mappingData: Omit<SchemaMapping, 'id'>): Promise<string> {
    // Generate mapping ID
    const mappingId = uuidv4();
    
    // Create mapping object
    const mapping: SchemaMapping = {
      id: mappingId,
      ...mappingData,
      metadata: mappingData.metadata || new Map()
    };
    
    // Validate mapping
    this.validateSchemaMapping(mapping);
    
    // Add to memory
    this.schemaMappings.set(mappingId, mapping);
    
    // Store in database
    await this.db.schemaMappings.create({
      uuid: mappingId,
      name: mapping.name,
      description: mapping.description,
      source_schema: mapping.sourceSchema,
      target_schema: mapping.targetSchema,
      mapping_rules: mapping.mappingRules,
      version: mapping.version,
      metadata: Object.fromEntries(mapping.metadata)
    });
    
    return mappingId;
  }
  
  async applySchemaMapping(mappingId: string, sourceData: any): Promise<any> {
    // Get mapping
    const mapping = await this.getSchemaMapping(mappingId);
    
    // Validate source data against source schema
    this.validateData(sourceData, mapping.sourceSchema);
    
    // Apply mapping rules
    const targetData = {};
    
    for (const rule of mapping.mappingRules) {
      // Get source value
      const sourceValue = this.getValueByPath(sourceData, rule.sourcePath);
      
      // Check condition
      if (rule.condition && !this.evaluateCondition(rule.condition, sourceData)) {
        // Condition not met, use default value if required
        if (rule.required && rule.defaultValue !== undefined) {
          this.setValueByPath(targetData, rule.targetPath, rule.defaultValue);
        }
        continue;
      }
      
      // Apply transformation
      let targetValue = sourceValue;
      if (rule.transformation) {
        targetValue = this.applyTransformation(sourceValue, rule.transformation);
      }
      
      // Set target value
      if (targetValue !== undefined || rule.defaultValue !== undefined) {
        this.setValueByPath(targetData, rule.targetPath, targetValue !== undefined ? targetValue : rule.defaultValue);
      } else if (rule.required) {
        throw new Error(`Required mapping rule ${rule.id} has no value and no default value`);
      }
    }
    
    // Validate target data against target schema
    this.validateData(targetData, mapping.targetSchema);
    
    return targetData;
  }
  
  // Data Validator Methods
  
  async createDataValidator(validatorData: Omit<DataValidator, 'id'>): Promise<string> {
    // Generate validator ID
    const validatorId = uuidv4();
    
    // Create validator object
    const validator: DataValidator = {
      id: validatorId,
      ...validatorData,
      metadata: validatorData.metadata || new Map()
    };
    
    // Validate validator
    this.validateDataValidator(validator);
    
    // Add to memory
    this.dataValidators.set(validatorId, validator);
    
    // Store in database
    await this.db.dataValidators.create({
      uuid: validatorId,
      name: validator.name,
      description: validator.description,
      schema: validator.schema,
      rules: validator.rules,
      version: validator.version,
      metadata: Object.fromEntries(validator.metadata)
    });
    
    return validatorId;
  }
  
  async validateData(data: any, schema: any): Promise<ValidationResult> {
    // Validate data against schema
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // Implement schema validation logic
    // This could use JSON Schema, Joi, Yup, or other validation libraries
    
    return result;
  }
  
  // Transformation Pipeline Methods
  
  async createTransformationPipeline(pipelineData: Omit<TransformationPipeline, 'id'>): Promise<string> {
    // Generate pipeline ID
    const pipelineId = uuidv4();
    
    // Create pipeline object
    const pipeline: TransformationPipeline = {
      id: pipelineId,
      ...pipelineData,
      metadata: pipelineData.metadata || new Map()
    };
    
    // Validate pipeline
    this.validateTransformationPipeline(pipeline);
    
    // Add to memory
    this.transformationPipelines.set(pipelineId, pipeline);
    
    // Store in database
    await this.db.transformationPipelines.create({
      uuid: pipelineId,
      name: pipeline.name,
      description: pipeline.description,
      steps: pipeline.steps,
      version: pipeline.version,
      metadata: Object.fromEntries(pipeline.metadata)
    });
    
    return pipelineId;
  }
  
  async executePipeline(pipelineId: string, inputData: any): Promise<any> {
    // Get pipeline
    const pipeline = await this.getTransformationPipeline(pipelineId);
    
    // Sort steps by order
    const sortedSteps = [...pipeline.steps].sort((a, b) => a.order - b.order);
    
    // Execute steps
    let data = inputData;
    
    for (const step of sortedSteps) {
      // Check condition
      if (step.condition && !this.evaluateCondition(step.condition, data)) {
        continue;
      }
      
      try {
        // Execute step
        data = await this.executeStep(step, data);
      } catch (error) {
        // Handle error
        if (step.errorHandler) {
          data = await this.handleStepError(step.errorHandler, error, step, data);
        } else {
          throw error;
        }
      }
    }
    
    return data;
  }
  
  // Helper Methods
  
  private async getIntegrationDefinition(definitionId: string): Promise<IntegrationDefinition> {
    // Check in memory
    if (this.definitions.has(definitionId)) {
      return this.definitions.get(definitionId);
    }
    
    // Get from database
    const definitionData = await this.db.integrationDefinitions.findByUuid(definitionId);
    if (!definitionData) {
      throw new Error(`Integration definition ${definitionId} not found`);
    }
    
    // Convert to IntegrationDefinition object
    const definition: IntegrationDefinition = {
      id: definitionData.uuid,
      name: definitionData.name,
      description: definitionData.description,
      type: definitionData.type as IntegrationType,
      version: definitionData.version,
      provider: definitionData.provider,
      endpoints: definitionData.endpoints,
      authentication: definitionData.authentication,
      configuration: definitionData.configuration,
      status: definitionData.status as IntegrationStatus,
      metadata: new Map(Object.entries(definitionData.metadata || {}))
    };
    
    // Add to memory
    this.definitions.set(definitionId, definition);
    
    return definition;
  }
  
  private async getIntegrationInstance(instanceId: string): Promise<IntegrationInstance> {
    // Check in memory
    if (this.instances.has(instanceId)) {
      return this.instances.get(instanceId);
    }
    
    // Get from database
    const instanceData = await this.db.integrationInstances.findByUuid(instanceId);
    if (!instanceData) {
      throw new Error(`Integration instance ${instanceId} not found`);
    }
    
    // Convert to IntegrationInstance object
    const instance: IntegrationInstance = {
      id: instanceData.uuid,
      definitionId: instanceData.definition_id,
      name: instanceData.name,
      description: instanceData.description,
      configuration: instanceData.configuration,
      credentials: instanceData.credentials,
      status: instanceData.status as InstanceStatus,
      healthCheck: instanceData.health_check,
      createdAt: instanceData.created_at,
      updatedAt: instanceData.updated_at,
      metadata: new Map(Object.entries(instanceData.metadata || {}))
    };
    
    // Add to memory
    this.instances.set(instanceId, instance);
    
    return instance;
  }
  
  private async getSchemaMapping(mappingId: string): Promise<SchemaMapping> {
    // Check in memory
    if (this.schemaMappings.has(mappingId)) {
      return this.schemaMappings.get(mappingId);
    }
    
    // Get from database
    const mappingData = await this.db.schemaMappings.findByUuid(mappingId);
    if (!mappingData) {
      throw new Error
