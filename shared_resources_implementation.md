# Shared Resources Implementation

```typescript
// Shared Workspace
class SharedWorkspace {
  private resources: Map<string, SharedResource>;
  private accessLogs: AccessLog[];
  private locks: Map<string, Lock>;
  
  constructor(private db: Database) {
    this.resources = new Map();
    this.accessLogs = [];
    this.locks = new Map();
  }
  
  async initialize(): Promise<void> {
    // Load resources from database
    const resourceData = await this.db.sharedResources.findAll();
    for (const data of resourceData) {
      this.resources.set(data.uuid, {
        id: data.uuid,
        name: data.name,
        type: data.type as ResourceType,
        content: data.content,
        metadata: new Map(Object.entries(data.metadata || {})),
        version: data.version,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
        accessControl: {
          readAccess: data.read_access,
          writeAccess: data.write_access,
          ownerAccess: data.owner_access
        }
      });
    }
    
    // Load access logs
    const logData = await this.db.accessLogs.findAll();
    this.accessLogs = logData.map(data => ({
      resourceId: data.resource_id,
      agentId: data.agent_id,
      action: data.action as AccessAction,
      timestamp: data.timestamp,
      success: data.success,
      metadata: new Map(Object.entries(data.metadata || {}))
    }));
  }
  
  async createResource(
    resource: SharedResource,
    agentId: string
  ): Promise<string> {
    // Validate resource
    if (!resource.name || !resource.type) {
      throw new Error('Resource name and type are required');
    }
    
    // Generate ID if not provided
    const resourceId = resource.id || uuidv4();
    
    // Set creation metadata
    const now = new Date();
    resource.id = resourceId;
    resource.createdAt = now;
    resource.updatedAt = now;
    resource.createdBy = agentId;
    resource.updatedBy = agentId;
    resource.version = 1;
    
    // Set default access control if not provided
    if (!resource.accessControl) {
      resource.accessControl = {
        readAccess: ['*'],  // All agents can read
        writeAccess: [agentId], // Only creator can write
        ownerAccess: [agentId]  // Only creator is owner
      };
    }
    
    // Store in memory
    this.resources.set(resourceId, resource);
    
    // Store in database
    await this.db.sharedResources.create({
      uuid: resourceId,
      name: resource.name,
      type: resource.type,
      content: resource.content,
      metadata: Object.fromEntries(resource.metadata || new Map()),
      version: resource.version,
      created_at: resource.createdAt,
      updated_at: resource.updatedAt,
      created_by: resource.createdBy,
      updated_by: resource.updatedBy,
      read_access: resource.accessControl.readAccess,
      write_access: resource.accessControl.writeAccess,
      owner_access: resource.accessControl.ownerAccess
    });
    
    // Log access
    await this.logAccess({
      resourceId,
      agentId,
      action: 'CREATE',
      timestamp: now,
      success: true,
      metadata: new Map()
    });
    
    return resourceId;
  }
  
  async getResource(
    resourceId: string,
    agentId: string
  ): Promise<SharedResource> {
    // Get resource
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    // Check read access
    if (!this.hasReadAccess(resource, agentId)) {
      // Log unauthorized access attempt
      await this.logAccess({
        resourceId,
        agentId,
        action: 'READ',
        timestamp: new Date(),
        success: false,
        metadata: new Map([['reason', 'unauthorized']])
      });
      
      throw new Error(`Agent ${agentId} does not have read access to resource ${resourceId}`);
    }
    
    // Log access
    await this.logAccess({
      resourceId,
      agentId,
      action: 'READ',
      timestamp: new Date(),
      success: true,
      metadata: new Map()
    });
    
    return resource;
  }
  
  async updateResource(
    resourceId: string,
    updates: Partial<SharedResource>,
    agentId: string
  ): Promise<SharedResource> {
    // Get resource
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    // Check write access
    if (!this.hasWriteAccess(resource, agentId)) {
      // Log unauthorized access attempt
      await this.logAccess({
        resourceId,
        agentId,
        action: 'UPDATE',
        timestamp: new Date(),
        success: false,
        metadata: new Map([['reason', 'unauthorized']])
      });
      
      throw new Error(`Agent ${agentId} does not have write access to resource ${resourceId}`);
    }
    
    // Check if resource is locked
    const lock = this.locks.get(resourceId);
    if (lock && lock.agentId !== agentId) {
      // Log lock conflict
      await this.logAccess({
        resourceId,
        agentId,
        action: 'UPDATE',
        timestamp: new Date(),
        success: false,
        metadata: new Map([['reason', 'locked'], ['lockHolder', lock.agentId]])
      });
      
      throw new Error(`Resource ${resourceId} is locked by agent ${lock.agentId}`);
    }
    
    // Update resource
    const now = new Date();
    const updatedResource: SharedResource = {
      ...resource,
      ...updates,
      id: resourceId, // Ensure ID doesn't change
      updatedAt: now,
      updatedBy: agentId,
      version: resource.version + 1
    };
    
    // Store in memory
    this.resources.set(resourceId, updatedResource);
    
    // Store in database
    await this.db.sharedResources.update(resourceId, {
      name: updatedResource.name,
      type: updatedResource.type,
      content: updatedResource.content,
      metadata: Object.fromEntries(updatedResource.metadata || new Map()),
      version: updatedResource.version,
      updated_at: updatedResource.updatedAt,
      updated_by: updatedResource.updatedBy,
      read_access: updatedResource.accessControl.readAccess,
      write_access: updatedResource.accessControl.writeAccess,
      owner_access: updatedResource.accessControl.ownerAccess
    });
    
    // Log access
    await this.logAccess({
      resourceId,
      agentId,
      action: 'UPDATE',
      timestamp: now,
      success: true,
      metadata: new Map()
    });
    
    return updatedResource;
  }
  
  async deleteResource(
    resourceId: string,
    agentId: string
  ): Promise<void> {
    // Get resource
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    // Check owner access
    if (!this.hasOwnerAccess(resource, agentId)) {
      // Log unauthorized access attempt
      await this.logAccess({
        resourceId,
        agentId,
        action: 'DELETE',
        timestamp: new Date(),
        success: false,
        metadata: new Map([['reason', 'unauthorized']])
      });
      
      throw new Error(`Agent ${agentId} does not have owner access to resource ${resourceId}`);
    }
    
    // Remove from memory
    this.resources.delete(resourceId);
    
    // Remove from database
    await this.db.sharedResources.delete(resourceId);
    
    // Log access
    await this.logAccess({
      resourceId,
      agentId,
      action: 'DELETE',
      timestamp: new Date(),
      success: true,
      metadata: new Map()
    });
  }
  
  async lockResource(
    resourceId: string,
    agentId: string,
    duration: number = 60000 // Default: 1 minute
  ): Promise<void> {
    // Get resource
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    // Check write access
    if (!this.hasWriteAccess(resource, agentId)) {
      throw new Error(`Agent ${agentId} does not have write access to resource ${resourceId}`);
    }
    
    // Check if already locked
    const existingLock = this.locks.get(resourceId);
    if (existingLock) {
      if (existingLock.agentId === agentId) {
        // Extend lock
        existingLock.expiresAt = new Date(Date.now() + duration);
        return;
      } else {
        throw new Error(`Resource ${resourceId} is already locked by agent ${existingLock.agentId}`);
      }
    }
    
    // Create lock
    const lock: Lock = {
      resourceId,
      agentId,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + duration)
    };
    
    // Store lock
    this.locks.set(resourceId, lock);
    
    // Schedule lock expiration
    setTimeout(() => {
      this.releaseLockIfExpired(resourceId);
    }, duration);
    
    // Log access
    await this.logAccess({
      resourceId,
      agentId,
      action: 'LOCK',
      timestamp: new Date(),
      success: true,
      metadata: new Map([['duration', duration.toString()]])
    });
  }
  
  async unlockResource(
    resourceId: string,
    agentId: string
  ): Promise<void> {
    // Check if locked
    const lock = this.locks.get(resourceId);
    if (!lock) {
      return; // Not locked, nothing to do
    }
    
    // Check if agent holds the lock
    if (lock.agentId !== agentId) {
      throw new Error(`Resource ${resourceId} is locked by agent ${lock.agentId}, not ${agentId}`);
    }
    
    // Release lock
    this.locks.delete(resourceId);
    
    // Log access
    await this.logAccess({
      resourceId,
      agentId,
      action: 'UNLOCK',
      timestamp: new Date(),
      success: true,
      metadata: new Map()
    });
  }
  
  async getResourceHistory(
    resourceId: string,
    agentId: string
  ): Promise<AccessLog[]> {
    // Get resource
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    // Check read access
    if (!this.hasReadAccess(resource, agentId)) {
      throw new Error(`Agent ${agentId} does not have read access to resource ${resourceId}`);
    }
    
    // Get logs for this resource
    return this.accessLogs.filter(log => log.resourceId === resourceId);
  }
  
  async searchResources(
    query: ResourceQuery,
    agentId: string
  ): Promise<SharedResource[]> {
    // Filter resources
    const results: SharedResource[] = [];
    
    for (const resource of this.resources.values()) {
      // Check read access
      if (!this.hasReadAccess(resource, agentId)) {
        continue;
      }
      
      // Check type filter
      if (query.type && resource.type !== query.type) {
        continue;
      }
      
      // Check name filter
      if (query.name && !resource.name.includes(query.name)) {
        continue;
      }
      
      // Check content filter
      if (query.contentContains && !resource.content.includes(query.contentContains)) {
        continue;
      }
      
      // Check created by filter
      if (query.createdBy && resource.createdBy !== query.createdBy) {
        continue;
      }
      
      // Check updated by filter
      if (query.updatedBy && resource.updatedBy !== query.updatedBy) {
        continue;
      }
      
      // Check created after filter
      if (query.createdAfter && resource.createdAt < query.createdAfter) {
        continue;
      }
      
      // Check updated after filter
      if (query.updatedAfter && resource.updatedAt < query.updatedAfter) {
        continue;
      }
      
      // All filters passed, add to results
      results.push(resource);
    }
    
    // Log access
    await this.logAccess({
      resourceId: 'search',
      agentId,
      action: 'SEARCH',
      timestamp: new Date(),
      success: true,
      metadata: new Map([['query', JSON.stringify(query)], ['resultCount', results.length.toString()]])
    });
    
    return results;
  }
  
  private hasReadAccess(resource: SharedResource, agentId: string): boolean {
    const { readAccess } = resource.accessControl;
    return readAccess.includes('*') || readAccess.includes(agentId);
  }
  
  private hasWriteAccess(resource: SharedResource, agentId: string): boolean {
    const { writeAccess } = resource.accessControl;
    return writeAccess.includes('*') || writeAccess.includes(agentId);
  }
  
  private hasOwnerAccess(resource: SharedResource, agentId: string): boolean {
    const { ownerAccess } = resource.accessControl;
    return ownerAccess.includes(agentId);
  }
  
  private async logAccess(log: AccessLog): Promise<void> {
    // Add to memory
    this.accessLogs.push(log);
    
    // Add to database
    await this.db.accessLogs.create({
      resource_id: log.resourceId,
      agent_id: log.agentId,
      action: log.action,
      timestamp: log.timestamp,
      success: log.success,
      metadata: Object.fromEntries(log.metadata || new Map())
    });
  }
  
  private releaseLockIfExpired(resourceId: string): void {
    const lock = this.locks.get(resourceId);
    if (lock && lock.expiresAt <= new Date()) {
      this.locks.delete(resourceId);
      
      // Log expiration
      this.logAccess({
        resourceId,
        agentId: lock.agentId,
        action: 'UNLOCK',
        timestamp: new Date(),
        success: true,
        metadata: new Map([['reason', 'expired']])
      }).catch(error => {
        console.error(`Error logging lock expiration for resource ${resourceId}:`, error);
      });
    }
  }
}

// Shared Resource
interface SharedResource {
  id: string;                     // Unique resource ID
  name: string;                   // Human-readable name
  type: ResourceType;             // Resource type
  content: any;                   // Resource content (can be any type)
  metadata: Map<string, any>;     // Additional metadata
  version: number;                // Resource version
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  createdBy: string;              // Creator agent ID
  updatedBy: string;              // Last updater agent ID
  accessControl: AccessControl;   // Access control settings
}

// Resource Type
enum ResourceType {
  DOCUMENT = 'document',
  CODE = 'code',
  DATA = 'data',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  MODEL = 'model',
  CONFIG = 'config',
  OTHER = 'other'
}

// Access Control
interface AccessControl {
  readAccess: string[];           // Agent IDs with read access
  writeAccess: string[];          // Agent IDs with write access
  ownerAccess: string[];          // Agent IDs with owner access
}

// Access Action
type AccessAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK' | 'SEARCH';

// Access Log
interface AccessLog {
  resourceId: string;             // Resource ID
  agentId: string;                // Agent ID
  action: AccessAction;           // Action performed
  timestamp: Date;                // Timestamp
  success: boolean;               // Whether action succeeded
  metadata: Map<string, string>;  // Additional metadata
}

// Resource Lock
interface Lock {
  resourceId: string;             // Resource ID
  agentId: string;                // Agent ID holding the lock
  acquiredAt: Date;               // When lock was acquired
  expiresAt: Date;                // When lock expires
}

// Resource Query
interface ResourceQuery {
  type?: ResourceType;            // Filter by resource type
  name?: string;                  // Filter by name (substring match)
  contentContains?: string;       // Filter by content (substring match)
  createdBy?: string;             // Filter by creator
  updatedBy?: string;             // Filter by updater
  createdAfter?: Date;            // Filter by creation date
  updatedAfter?: Date;            // Filter by update date
}

// Knowledge Repository
class KnowledgeRepository {
  private sharedWorkspace: SharedWorkspace;
  
  constructor(
    private db: Database,
    private agentManager: AgentLifecycleManager
  ) {
    this.sharedWorkspace = new SharedWorkspace(db);
  }
  
  async initialize(): Promise<void> {
    await this.sharedWorkspace.initialize();
  }
  
  async createKnowledgeItem(
    item: KnowledgeItem,
    agentId: string
  ): Promise<string> {
    // Validate knowledge item
    if (!item.title || !item.content) {
      throw new Error('Knowledge item title and content are required');
    }
    
    // Create resource
    const resourceId = await this.sharedWorkspace.createResource(
      {
        id: item.id,
        name: item.title,
        type: ResourceType.DOCUMENT,
        content: item.content,
        metadata: new Map(Object.entries({
          type: 'knowledge',
          tags: item.tags?.join(',') || '',
          source: item.source || '',
          confidence: item.confidence?.toString() || '1.0',
          format: item.format || 'text'
        })),
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: agentId,
        updatedBy: agentId,
        accessControl: {
          readAccess: item.readAccess || ['*'],
          writeAccess: item.writeAccess || [agentId],
          ownerAccess: item.ownerAccess || [agentId]
        }
      },
      agentId
    );
    
    return resourceId;
  }
  
  async getKnowledgeItem(
    itemId: string,
    agentId: string
  ): Promise<KnowledgeItem> {
    // Get resource
    const resource = await this.sharedWorkspace.getResource(itemId, agentId);
    
    // Convert to knowledge item
    return this.resourceToKnowledgeItem(resource);
  }
  
  async updateKnowledgeItem(
    itemId: string,
    updates: Partial<KnowledgeItem>,
    agentId: string
  ): Promise<KnowledgeItem> {
    // Get existing item
    const existingResource = await this.sharedWorkspace.getResource(itemId, agentId);
    
    // Prepare updates
    const resourceUpdates: Partial<SharedResource> = {};
    
    if (updates.title) {
      resourceUpdates.name = updates.title;
    }
    
    if (updates.content) {
      resourceUpdates.content = updates.content;
    }
    
    if (updates.tags || updates.source || updates.confidence || updates.format) {
      const metadata = new Map(existingResource.metadata);
      
      if (updates.tags) {
        metadata.set('tags', updates.tags.join(','));
      }
      
      if (updates.source) {
        metadata.set('source', updates.source);
      }
      
      if (updates.confidence) {
        metadata.set('confidence', updates.confidence.toString());
      }
      
      if (updates.format) {
        metadata.set('format', updates.format);
      }
      
      resourceUpdates.metadata = metadata;
    }
    
    if (updates.readAccess || updates.writeAccess || updates.ownerAccess) {
      const accessControl = { ...existingResource.accessControl };
      
      if (updates.readAccess) {
        accessControl.readAccess = updates.readAccess;
      }
      
      if (updates.writeAccess) {
        accessControl.writeAccess = updates.writeAccess;
      }
      
      if (updates.ownerAccess) {
        accessControl.ownerAccess = updates.ownerAccess;
      }
      
      resourceUpdates.accessControl = accessControl;
    }
    
    // Update resource
    const updatedResource = await this.sharedWorkspace.updateResource(
      itemId,
      resourceUpdates,
      agentId
    );
    
    // Convert to knowledge item
    return this.resourceToKnowledgeItem(updatedResource);
  }
  
  async deleteKnowledgeItem(
    itemId: string,
    agentId: string
  ): Promise<void> {
    await this.sharedWorkspace.deleteResource(itemId, agentId);
  }
  
  async searchKnowledge(
    query: KnowledgeQuery,
    agentId: string
  ): Promise<KnowledgeItem[]> {
    // Convert to resource query
    const resourceQuery: ResourceQuery = {
      type: ResourceType.DOCUMENT,
      name: query.titleContains,
      contentContains: query.contentContains,
      createdBy: query.createdBy,
      updatedBy: query.updatedBy,
      createdAfter: query.createdAfter,
      updatedAfter: query.updatedAfter
    };
    
    // Search resources
    const resources = await this.sharedWorkspace.searchResources(resourceQuery, agentId);
    
    // Filter by metadata
    const results = resources.filter(resource => {
      // Check if it's a knowledge item
      if (resource.metadata.get('type') !== 'knowledge') {
        return false;
      }
      
      // Check tags
      if (query.tags && query.tags.length > 0) {
        const resourceTags = (resource.metadata.get('tags') || '').split(',');
        if (!query.tags.some(tag => resourceTags.includes(tag))) {
          return false;
        }
      }
      
      // Check source
      if (query.source && resource.metadata.get('source') !== query.source) {
        return false;
      }
      
      // Check minimum confidence
      if (query.minConfidence) {
        const confidence = parseFloat(resource.metadata.get('confidence') || '1.0');
        if (confidence < query.minConfidence) {
          return false;
        }
      }
      
      // Check format
      if (query.format && resource.metadata.get('format') !== query.format) {
        return false;
      }
      
      return true;
    });
    
    // Convert to knowledge items
    return results.map(resource => this.resourceToKnowledgeItem(resource));
  }
  
  private resourceToKnowledgeItem(resource: SharedResource): KnowledgeItem {
    return {
      id: resource.id,
      title: resource.name,
      content: resource.content,
      tags: (resource.metadata.get('tags') || '').split(',').filter(Boolean),
      source: resource.metadata.get('source'),
      confidence: parseFloat(resource.metadata.get('confidence') || '1.0'),
      format: resource.metadata.get('format') || 'text',
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      createdBy: resource.createdBy,
      updatedBy: resource.updatedBy,
      readAccess: resource.accessControl.readAccess,
      writeAccess: resource.accessControl.writeAccess,
      ownerAccess: resource.accessControl.ownerAccess
    };
  }
}

// Knowledge Item
interface KnowledgeItem {
  id?: string;                    // Unique item ID (optional for creation)
  title: string;                  // Item title
  content: any;                   // Item content
  tags?: string[];                // Tags for categorization
  source?: string;                // Source of the knowledge
  confidence?: number;            // Confidence level (0-1)
  format?: string;                // Content format (text, json, etc.)
  createdAt?: Date;               // Creation timestamp
  updatedAt?: Date;               // Last update timestamp
  createdBy?: string;             // Creator agent ID
  updatedBy?: string;             // Last updater agent ID
  readAccess?: string[];          // Agent IDs with read access
  writeAccess?: string[];         // Agent IDs with write access
  ownerAccess?: string[];         // Agent IDs with owner access
}

// Knowledge Query
interface KnowledgeQuery {
  titleContains?: string;         // Filter by title (substring match)
  contentContains?: string;       // Filter by content (substring match)
  tags?: string[];                // Filter by tags (any match)
  source?: string;                // Filter by source
  minConfidence?: number;         // Filter by minimum confidence
  format?: string;                // Filter by format
  createdBy?: string;             // Filter by creator
  updatedBy?: string;             // Filter by updater
  createdAfter?: Date;            // Filter by creation date
  updatedAfter?: Date;            // Filter by update date
}
