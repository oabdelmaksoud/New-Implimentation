# Admin System

## Overview

The Admin System component provides centralized control over the entire platform, allowing administrators to manage projects, features, agent configurations, and system settings. This document outlines the detailed implementation plan for the Admin System.

## Objectives

- Implement centralized platform administration
- Create feature management and control
- Develop LLM provider management
- Implement system-wide configuration

## Tasks

1. **Admin Portal Implementation**
   - Create admin dashboard
   - Implement user management
   - Develop role-based access control
   - Create audit logging

2. **Feature Management**
   - Implement feature registry
   - Create feature toggle system
   - Develop feature dependency management
   - Implement feature access control

3. **LLM Provider Management**
   - Create provider registry
   - Implement API key management
   - Develop provider selection
   - Create usage monitoring

4. **System Configuration**
   - Implement configuration management
   - Create environment settings
   - Develop backup and restore
   - Implement system health monitoring

## Micro-Level Implementation Details

### Admin System Structure

```typescript
// Feature Definition
interface Feature {
  id: string;                     // Unique feature ID
  name: string;                   // Feature name
  description: string;            // Feature description
  category: FeatureCategory;      // Feature category
  dependencies: string[];         // Dependent feature IDs
  defaultEnabled: boolean;        // Default enabled state
  configSchema: any;              // JSON Schema for configuration
  metadata: Map<string, any>;     // Additional metadata
}

// Feature Category
enum FeatureCategory {
  CORE = 'core',
  AGENT = 'agent',
  PROJECT = 'project',
  INTEGRATION = 'integration',
  ANALYTICS = 'analytics',
  SECURITY = 'security'
}

// Feature Toggle
interface FeatureToggle {
  featureId: string;              // Feature ID
  enabled: boolean;               // Enabled state
  scope: ToggleScope;             // Toggle scope
  scopeId?: string;               // Scope ID (for project/user scopes)
  configuration: any;             // Feature configuration
  lastModified: Date;             // Last modified timestamp
  modifiedBy: string;             // User ID who modified
}

// Toggle Scope
enum ToggleScope {
  GLOBAL = 'global',
  PROJECT = 'project',
  USER = 'user'
}

// LLM Provider
interface LLMProvider {
  id: string;                     // Unique provider ID
  name: string;                   // Provider name
  description: string;            // Provider description
  apiEndpoint: string;            // API endpoint
  authType: AuthType;             // Authentication type
  models: LLMModel[];             // Available models
  defaultModel: string;           // Default model ID
  status: ProviderStatus;         // Provider status
  metadata: Map<string, any>;     // Additional metadata
}

// Authentication Type
enum AuthType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  BASIC = 'basic',
  NONE = 'none'
}

// Provider Status
enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated'
}

// LLM Model
interface LLMModel {
  id: string;                     // Unique model ID
  name: string;                   // Model name
  version: string;                // Model version
  capabilities: string[];         // Model capabilities
  contextWindow: number;          // Context window size
  maxTokens: number;              // Maximum tokens
  costPerToken: number;           // Cost per token
  metadata: Map<string, any>;     // Additional metadata
}

// API Key
interface APIKey {
  id: string;                     // Unique key ID
  providerId: string;             // Provider ID
  key: string;                    // Encrypted API key
  name: string;                   // Key name
  created: Date;                  // Creation timestamp
  expires?: Date;                 // Expiration timestamp
  lastUsed?: Date;                // Last used timestamp
  usageLimit?: number;            // Usage limit
  currentUsage: number;           // Current usage
  status: KeyStatus;              // Key status
  metadata: Map<string, any>;     // Additional metadata
}

// Key Status
enum KeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

// System Configuration
interface SystemConfiguration {
  id: string;                     // Configuration ID
  category: string;               // Configuration category
  key: string;                    // Configuration key
  value: any;                     // Configuration value
  dataType: string;               // Data type
  description: string;            // Description
  defaultValue: any;              // Default value
  scope: ConfigScope;             // Configuration scope
  scopeId?: string;               // Scope ID
  lastModified: Date;             // Last modified timestamp
  modifiedBy: string;             // User ID who modified
}

// Configuration Scope
enum ConfigScope {
  GLOBAL = 'global',
  PROJECT = 'project',
  USER = 'user'
}

// Admin User
interface AdminUser {
  id: string;                     // User ID
  username: string;               // Username
  email: string;                  // Email
  roles: AdminRole[];             // Admin roles
  permissions: string[];          // Permissions
  lastLogin?: Date;               // Last login timestamp
  status: UserStatus;             // User status
  metadata: Map<string, any>;     // Additional metadata
}

// Admin Role
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  PROJECT_ADMIN = 'project_admin',
  USER_ADMIN = 'user_admin',
  READONLY = 'readonly'
}

// User Status
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  PENDING = 'pending'
}

// Audit Log Entry
interface AuditLogEntry {
  id: string;                     // Log entry ID
  timestamp: Date;                // Event timestamp
  userId: string;                 // User ID
  action: string;                 // Action performed
  resource: string;               // Resource affected
  resourceId: string;             // Resource ID
  details: any;                   // Action details
  ipAddress: string;              // IP address
  userAgent: string;              // User agent
}
```

### Admin System Implementation

```typescript
// Admin System
class AdminSystem {
  private db: Database;
  private features: Map<string, Feature>;
  private featureToggles: Map<string, FeatureToggle[]>;
  private providers: Map<string, LLMProvider>;
  private apiKeys: Map<string, APIKey[]>;
  private configurations: Map<string, SystemConfiguration>;
  private adminUsers: Map<string, AdminUser>;
  private auditLog: AuditLogEntry[];
  
  constructor(db: Database) {
    this.db = db;
    this.features = new Map();
    this.featureToggles = new Map();
    this.providers = new Map();
    this.apiKeys = new Map();
    this.configurations = new Map();
    this.adminUsers = new Map();
    this.auditLog = [];
  }
  
  async initialize(): Promise<void> {
    // Load features from database
    const featureData = await this.db.features.findAll();
    for (const data of featureData) {
      const feature: Feature = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        category: data.category as FeatureCategory,
        dependencies: data.dependencies,
        defaultEnabled: data.default_enabled,
        configSchema: data.config_schema,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.features.set(feature.id, feature);
    }
    
    // Load feature toggles from database
    const toggleData = await this.db.featureToggles.findAll();
    for (const data of toggleData) {
      const toggle: FeatureToggle = {
        featureId: data.feature_id,
        enabled: data.enabled,
        scope: data.scope as ToggleScope,
        scopeId: data.scope_id,
        configuration: data.configuration,
        lastModified: data.last_modified,
        modifiedBy: data.modified_by
      };
      
      if (!this.featureToggles.has(toggle.featureId)) {
        this.featureToggles.set(toggle.featureId, []);
      }
      
      this.featureToggles.get(toggle.featureId).push(toggle);
    }
    
    // Load LLM providers from database
    const providerData = await this.db.llmProviders.findAll();
    for (const data of providerData) {
      const provider: LLMProvider = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        apiEndpoint: data.api_endpoint,
        authType: data.auth_type as AuthType,
        models: data.models,
        defaultModel: data.default_model,
        status: data.status as ProviderStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.providers.set(provider.id, provider);
    }
    
    // Load API keys from database
    const keyData = await this.db.apiKeys.findAll();
    for (const data of keyData) {
      const key: APIKey = {
        id: data.uuid,
        providerId: data.provider_id,
        key: data.key,
        name: data.name,
        created: data.created,
        expires: data.expires,
        lastUsed: data.last_used,
        usageLimit: data.usage_limit,
        currentUsage: data.current_usage,
        status: data.status as KeyStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      if (!this.apiKeys.has(key.providerId)) {
        this.apiKeys.set(key.providerId, []);
      }
      
      this.apiKeys.get(key.providerId).push(key);
    }
    
    // Load system configurations from database
    const configData = await this.db.systemConfigurations.findAll();
    for (const data of configData) {
      const config: SystemConfiguration = {
        id: data.uuid,
        category: data.category,
        key: data.key,
        value: data.value,
        dataType: data.data_type,
        description: data.description,
        defaultValue: data.default_value,
        scope: data.scope as ConfigScope,
        scopeId: data.scope_id,
        lastModified: data.last_modified,
        modifiedBy: data.modified_by
      };
      
      this.configurations.set(`${config.category}.${config.key}`, config);
    }
    
    // Load admin users from database
    const userData = await this.db.adminUsers.findAll();
    for (const data of userData) {
      const user: AdminUser = {
        id: data.uuid,
        username: data.username,
        email: data.email,
        roles: data.roles as AdminRole[],
        permissions: data.permissions,
        lastLogin: data.last_login,
        status: data.status as UserStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.adminUsers.set(user.id, user);
    }
  }
  
  // Feature Management
  
  async registerFeature(featureData: Omit<Feature, 'id'>): Promise<string> {
    // Generate feature ID
    const featureId = uuidv4();
    
    // Create feature object
    const feature: Feature = {
      id: featureId,
      ...featureData
    };
    
    // Validate feature
    this.validateFeature(feature);
    
    // Add to memory
    this.features.set(featureId, feature);
    
    // Store in database
    await this.db.features.create({
      uuid: featureId,
      name: feature.name,
      description: feature.description,
      category: feature.category,
      dependencies: feature.dependencies,
      default_enabled: feature.defaultEnabled,
      config_schema: feature.configSchema,
      metadata: Object.fromEntries(feature.metadata)
    });
    
    // Create default toggle
    await this.setFeatureToggle({
      featureId,
      enabled: feature.defaultEnabled,
      scope: ToggleScope.GLOBAL,
      configuration: {},
      lastModified: new Date(),
      modifiedBy: 'system'
    });
    
    return featureId;
  }
  
  async setFeatureToggle(toggleData: Omit<FeatureToggle, 'lastModified' | 'modifiedBy'>, userId: string = 'system'): Promise<void> {
    // Check if feature exists
    if (!this.features.has(toggleData.featureId)) {
      throw new Error(`Feature ${toggleData.featureId} not found`);
    }
    
    // Create toggle object
    const toggle: FeatureToggle = {
      ...toggleData,
      lastModified: new Date(),
      modifiedBy: userId
    };
    
    // Validate toggle
    this.validateFeatureToggle(toggle);
    
    // Add to memory
    if (!this.featureToggles.has(toggle.featureId)) {
      this.featureToggles.set(toggle.featureId, []);
    }
    
    // Find existing toggle with same scope and scopeId
    const existingIndex = this.featureToggles.get(toggle.featureId).findIndex(t => 
      t.scope === toggle.scope && t.scopeId === toggle.scopeId
    );
    
    if (existingIndex >= 0) {
      // Update existing toggle
      this.featureToggles.get(toggle.featureId)[existingIndex] = toggle;
      
      // Update in database
      await this.db.featureToggles.update({
        feature_id: toggle.featureId,
        scope: toggle.scope,
        scope_id: toggle.scopeId
      }, {
        enabled: toggle.enabled,
        configuration: toggle.configuration,
        last_modified: toggle.lastModified,
        modified_by: toggle.modifiedBy
      });
    } else {
      // Add new toggle
      this.featureToggles.get(toggle.featureId).push(toggle);
      
      // Store in database
      await this.db.featureToggles.create({
        feature_id: toggle.featureId,
        enabled: toggle.enabled,
        scope: toggle.scope,
        scope_id: toggle.scopeId,
        configuration: toggle.configuration,
        last_modified: toggle.lastModified,
        modified_by: toggle.modifiedBy
      });
    }
    
    // Log audit event
    await this.logAuditEvent({
      userId,
      action: existingIndex >= 0 ? 'update_feature_toggle' : 'create_feature_toggle',
      resource: 'feature_toggle',
      resourceId: `${toggle.featureId}:${toggle.scope}:${toggle.scopeId || 'global'}`,
      details: {
        featureId: toggle.featureId,
        enabled: toggle.enabled,
        scope: toggle.scope,
        scopeId: toggle.scopeId,
        configuration: toggle.configuration
      }
    });
  }
  
  async isFeatureEnabled(featureId: string, scope: ToggleScope = ToggleScope.GLOBAL, scopeId?: string): Promise<boolean> {
    // Check if feature exists
    if (!this.features.has(featureId)) {
      throw new Error(`Feature ${featureId} not found`);
    }
    
    // Get feature toggles
    const toggles = this.featureToggles.get(featureId) || [];
    
    // Check dependencies
    const feature = this.features.get(featureId);
    for (const depId of feature.dependencies) {
      const depEnabled = await this.isFeatureEnabled(depId, scope, scopeId);
      if (!depEnabled) {
        return false; // Dependency is disabled
      }
    }
    
    // Find toggle with matching scope and scopeId
    if (scope !== ToggleScope.GLOBAL && scopeId) {
      const scopedToggle = toggles.find(t => 
        t.scope === scope && t.scopeId === scopeId
      );
      
      if (scopedToggle) {
        return scopedToggle.enabled;
      }
    }
    
    // Fall back to global toggle
    const globalToggle = toggles.find(t => t.scope === ToggleScope.GLOBAL);
    if (globalToggle) {
      return globalToggle.enabled;
    }
    
    // Fall back to default
    return feature.defaultEnabled;
  }
  
  async getFeatureConfiguration(featureId: string, scope: ToggleScope = ToggleScope.GLOBAL, scopeId?: string): Promise<any> {
    // Check if feature exists
    if (!this.features.has(featureId)) {
      throw new Error(`Feature ${featureId} not found`);
    }
    
    // Get feature toggles
    const toggles = this.featureToggles.get(featureId) || [];
    
    // Find toggle with matching scope and scopeId
    if (scope !== ToggleScope.GLOBAL && scopeId) {
      const scopedToggle = toggles.find(t => 
        t.scope === scope && t.scopeId === scopeId
      );
      
      if (scopedToggle) {
        return scopedToggle.configuration;
      }
    }
    
    // Fall back to global toggle
    const globalToggle = toggles.find(t => t.scope === ToggleScope.GLOBAL);
    if (globalToggle) {
      return globalToggle.configuration;
    }
    
    // Fall back to empty configuration
    return {};
  }
  
  // LLM Provider Management
  
  async registerLLMProvider(providerData: Omit<LLMProvider, 'id' | 'status'>): Promise<string> {
    // Generate provider ID
    const providerId = uuidv4();
    
    // Create provider object
    const provider: LLMProvider = {
      id: providerId,
      ...providerData,
      status: ProviderStatus.INACTIVE // Start as inactive until API key is added
    };
    
    // Validate provider
    this.validateLLMProvider(provider);
    
    // Add to memory
    this.providers.set(providerId, provider);
    
    // Store in database
    await this.db.llmProviders.create({
      uuid: providerId,
      name: provider.name,
      description: provider.description,
      api_endpoint: provider.apiEndpoint,
      auth_type: provider.authType,
      models: provider.models,
      default_model: provider.defaultModel,
      status: provider.status,
      metadata: Object.fromEntries(provider.metadata)
    });
    
    return providerId;
  }
  
  async addAPIKey(keyData: Omit<APIKey, 'id' | 'created' | 'lastUsed' | 'currentUsage' | 'status'>, userId: string): Promise<string> {
    // Check if provider exists
    if (!this.providers.has(keyData.providerId)) {
      throw new Error(`Provider ${keyData.providerId} not found`);
    }
    
    // Generate key ID
    const keyId = uuidv4();
    
    // Create key object
    const key: APIKey = {
      id: keyId,
      ...keyData,
      created: new Date(),
      lastUsed: undefined,
      currentUsage: 0,
      status: KeyStatus.ACTIVE
    };
    
    // Encrypt API key
    key.key = await this.encryptAPIKey(key.key);
    
    // Validate key
    this.validateAPIKey(key);
    
    // Add to memory
    if (!this.apiKeys.has(key.providerId)) {
      this.apiKeys.set(key.providerId, []);
    }
    
    this.apiKeys.get(key.providerId).push(key);
    
    // Store in database
    await this.db.apiKeys.create({
      uuid: keyId,
      provider_id: key.providerId,
      key: key.key,
      name: key.name,
      created: key.created,
      expires: key.expires,
      last_used: key.lastUsed,
      usage_limit: key.usageLimit,
      current_usage: key.currentUsage,
      status: key.status,
      metadata: Object.fromEntries(key.metadata)
    });
    
    // Activate provider if it was inactive
    const provider = this.providers.get(key.providerId);
    if (provider.status === ProviderStatus.INACTIVE) {
      provider.status = ProviderStatus.ACTIVE;
      
      // Update in database
      await this.db.llmProviders.update(key.providerId, {
        status: provider.status
      });
    }
    
    // Log audit event
    await this.logAuditEvent({
      userId,
      action: 'add_api_key',
      resource: 'api_key',
      resourceId: keyId,
      details: {
        providerId: key.providerId,
        name: key.name,
        expires: key.expires,
        usageLimit: key.usageLimit
      }
    });
    
    return keyId;
  }
  
  async getActiveAPIKey(providerId: string): Promise<APIKey> {
    // Check if provider exists
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} not found`);
    }
    
    // Get API keys for provider
    const keys = this.apiKeys.get(providerId) || [];
    
    // Find active key with lowest usage
    const activeKeys = keys.filter(k => k.status === KeyStatus.ACTIVE);
    if (activeKeys.length === 0) {
      throw new Error(`No active API keys found for provider ${providerId}`);
    }
    
    // Sort by usage (ascending)
    activeKeys.sort((a, b) => {
      // If one has a usage limit and the other doesn't, prioritize the one without a limit
      if (a.usageLimit && !b.usageLimit) return 1;
      if (!a.usageLimit && b.usageLimit) return -1;
      
      // If both have usage limits, prioritize the one with more remaining capacity
      if (a.usageLimit && b.usageLimit) {
        const aRemaining = a.usageLimit - a.currentUsage;
        const bRemaining = b.usageLimit - b.currentUsage;
        return bRemaining - aRemaining;
      }
      
      // If neither has a usage limit, prioritize the one with less current usage
      return a.currentUsage - b.currentUsage;
    });
    
    // Return the first key (lowest usage)
    return activeKeys[0];
  }
  
  async updateAPIKeyUsage(keyId: string, tokensUsed: number): Promise<void> {
    // Find key
    let key: APIKey = null;
    let providerId: string = null;
    
    for (const [pId, keys] of this.apiKeys.entries()) {
      const found = keys.find(k => k.id === keyId);
      if (found) {
        key = found;
        providerId = pId;
        break;
      }
    }
    
    if (!key) {
      throw new Error(`API key ${keyId} not found`);
    }
    
    // Update usage
    key.currentUsage += tokensUsed;
    key.lastUsed = new Date();
    
    // Check if usage limit exceeded
    if (key.usageLimit && key.currentUsage >= key.usageLimit) {
      key.status = KeyStatus.INACTIVE;
    }
    
    // Update in database
    await this.db.apiKeys.update(keyId, {
      current_usage: key.currentUsage,
      last_used: key.lastUsed,
      status: key.status
    });
    
    // Check if all keys are inactive
    const activeKeys = this.apiKeys.get(providerId).filter(k => k.status === KeyStatus.ACTIVE);
    if (activeKeys.length === 0) {
      // Set provider to inactive
      const provider = this.providers.get(providerId);
      provider.status = ProviderStatus.INACTIVE;
      
      // Update in database
      await this.db.llmProviders.update(providerId, {
        status: provider.status
      });
    }
  }
  
  // System Configuration
  
  async setSystemConfiguration(configData: Omit<SystemConfiguration, 'id' | 'lastModified' | 'modifiedBy'>, userId: string): Promise<void> {
    // Generate config ID
    const configId = uuidv4();
    
    // Create config object
    const config: SystemConfiguration = {
      id: configId,
      ...configData,
      lastModified: new Date(),
      modifiedBy: userId
    };
    
    // Validate config
    this.validateSystemConfiguration(config);
    
    // Add to memory
    const configKey = `${config.category}.${config.key}`;
    this.configurations.set(configKey, config);
    
    // Check if config already exists in database
    const existingConfig = await this.db.systemConfigurations.findOne({
      category: config.category,
      key: config.key,
      scope: config.scope,
      scope_id: config.scopeId
    });
    
    if (existingConfig) {
      // Update existing config
      await this.db.systemConfigurations.update(existingConfig.uuid, {
        value: config.value,
        last_modified: config.lastModified,
        modified_by: config.modifiedBy
      });
    } else {
      // Create new config
      await this.db.systemConfigurations.create({
        uuid: configId,
        category: config.category,
        key: config.key,
        value: config.value,
        data_type: config.dataType,
        description: config.description,
        default_value: config.defaultValue,
        scope: config.scope,
        scope_id: config.scopeId,
        last_modified: config.lastModified,
        modified_by: config.modifiedBy
      });
    }
    
    // Log audit event
    await this.logAuditEvent({
      userId,
      action: existingConfig ? 'update_system_configuration' : 'create_system_configuration',
      resource: 'system_configuration',
      resourceId: configId,
      details: {
        category: config.category,
        key: config.key,
        value: config.value,
        scope: config.scope,
        scopeId: config.scopeId
      }
    });
  }
  
  async getSystemConfiguration(category: string, key: string, scope: ConfigScope = ConfigScope.GLOBAL, scopeId?: string): Promise<any> {
    // Try to find scoped configuration
    if (scope !== ConfigScope.GLOBAL && scopeId) {
      const scopedConfig = await this.db.systemConfigurations.findOne({
        category,
        key,
        scope,
        scope_id: scopeId
      });
      
      if (scopedConfig) {
        return scopedConfig.value;
      }
    }
    
    // Try to find global configuration
    const globalConfig = await this.db.systemConfigurations.findOne({
      category,
      key,
      scope: ConfigScope.GLOBAL
    });
    
    if (globalConfig) {
      return globalConfig.value;
    }
    
    // Try to find default configuration
    const defaultConfig = await this.db.systemConfigurations.findOne({
      category,
      key
    });
    
    if (defaultConfig) {
      return defaultConfig.default_value;
    }
    
    // Configuration not found
    throw new Error(`Configuration ${category}.${key} not found`);
  }
  
  // Admin User Management
  
  async createAdminUser(userData: Omit<AdminUser, 'id' | 'lastLogin' | 'status'>, creatorId: string): Promise<string> {
    // Generate user ID
    const userId = uuidv4();
    
    // Create user object
    const user: AdminUser = {
      id: userId,
      ...userData,
      lastLogin: undefined,
      status: UserStatus.PENDING
    };
    
    // Validate user
    this.validateAdminUser(user);
    
    // Add to memory
    this.adminUsers.set(userId, user);
    
    // Store in database
    await this.db.adminUsers.create({
      uuid: userId,
      username: user.username,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      last_login: user.lastLogin,
      status: user.status,
      metadata: Object.fromEntries(user.metadata)
    });
    
    // Log audit event
    await this.logAuditEvent({
      userId: creatorId,
      action: 'create_admin_user',
      resource: 'admin_user',
      resourceId: userId,
      details: {
        username: user.username,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      }
    });
    
    return userId;
  }
  
  async updateAdminUserStatus(userId: string, status: UserStatus, updaterId: string): Promise<void> {
    // Check if user exists
    if (!this.adminUsers.has(userId)) {
      throw new Error(`Admin user ${userId} not found`);
    }
    
    // Update user status
    const user = this.adminUsers.get(userId);
    user.status = status;
    
    // Update in database
    await this.db.adminUsers.update(userId, {
      status
    });
    
    // Log audit event
    await this.logAuditEvent({
      userId: updaterId,
      action: 'update_admin_user_status',
      resource: 'admin_user',
      resourceId: userId,
      details: {
        status
      }
    });
  }
  
  async updateAdminUserRoles(userId: string, roles: AdminRole[], updaterId: string): Promise<void> {
    // Check if user exists
    if (!this.adminUsers.has(userId)) {
      throw new Error(`Admin user ${userId} not found`);
    }
    
    // Update user roles
    const user = this.adminUsers.get(userId);
    user.roles = roles;
    
    // Update in database
    await this.db.adminUsers.update(userId, {
      roles
    });
    
    // Log audit event
    await this.logAuditEvent({
      userId: updaterId,
      action: 'update_admin_user_roles',
      resource: 'admin_user',
      resourceId: userId,
      details: {
        roles
      }
    });
  }
  
  // Audit Logging
  
  async logAuditEvent(eventData: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<string> {
    // Generate event ID
    const eventId = uuidv4();
    
    // Create event object
    const event: AuditLogEntry
