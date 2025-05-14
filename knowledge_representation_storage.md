# Knowledge Representation and Storage

## Overview

The Knowledge Representation and Storage component is a critical part of the Knowledge Management and Learning phase. It provides the foundation for storing, organizing, and retrieving knowledge within the agent system. This document outlines the detailed implementation plan for the Knowledge Representation and Storage system.

## Objectives

- Implement flexible knowledge representation
- Create efficient knowledge storage
- Develop knowledge retrieval mechanisms
- Implement knowledge validation and verification

## Tasks

1. **Knowledge Graph Implementation**
   - Implement entity and relationship models
   - Create graph database integration
   - Develop knowledge graph operations
   - Implement graph traversal and query

2. **Vector Storage for Embeddings**
   - Create vector embedding generation
   - Implement vector database integration
   - Develop similarity search
   - Create hybrid search capabilities

3. **Knowledge Indexing and Retrieval**
   - Implement full-text search
   - Create metadata-based indexing
   - Develop multi-modal indexing
   - Implement retrieval optimization

4. **Knowledge Validation Framework**
   - Create consistency checking
   - Implement fact verification
   - Develop source tracking
   - Create confidence scoring

## Micro-Level Implementation Details

### Knowledge Graph Structure

```typescript
// Knowledge Entity
interface KnowledgeEntity {
  id: string;                     // Unique entity ID
  type: string;                   // Entity type
  name: string;                   // Human-readable name
  properties: Map<string, any>;   // Entity properties
  projectId?: string;             // Associated project (optional)
  confidence: number;             // Confidence score (0-1)
  source?: string;                // Source of information
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Knowledge Relationship
interface KnowledgeRelationship {
  id: string;                     // Unique relationship ID
  type: string;                   // Relationship type
  sourceEntityId: string;         // Source entity ID
  targetEntityId: string;         // Target entity ID
  properties: Map<string, any>;   // Relationship properties
  projectId?: string;             // Associated project (optional)
  confidence: number;             // Confidence score (0-1)
  source?: string;                // Source of information
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Knowledge Graph
interface KnowledgeGraph {
  entities: Map<string, KnowledgeEntity>;       // Entities by ID
  relationships: Map<string, KnowledgeRelationship>; // Relationships by ID
  entityIndices: Map<string, Set<string>>;      // Entity indices by type
  relationshipIndices: Map<string, Set<string>>; // Relationship indices by type
  projectGraphs: Map<string, Set<string>>;      // Entity and relationship IDs by project
}

// Knowledge Query
interface KnowledgeQuery {
  entityTypes?: string[];         // Entity types to filter
  relationshipTypes?: string[];   // Relationship types to filter
  properties?: Map<string, any>;  // Property filters
  projectId?: string;             // Project filter
  confidenceThreshold?: number;   // Minimum confidence
  limit?: number;                 // Maximum results
  offset?: number;                // Result offset
  orderBy?: string;               // Order by field
  orderDirection?: 'asc' | 'desc'; // Order direction
}

// Knowledge Path
interface KnowledgePath {
  entities: KnowledgeEntity[];    // Entities in path
  relationships: KnowledgeRelationship[]; // Relationships in path
  confidence: number;             // Overall path confidence
}
```

### Knowledge Graph Manager

```typescript
// Knowledge Graph Manager
class KnowledgeGraphManager {
  private graph: KnowledgeGraph;
  private db: Database;
  
  constructor(db: Database) {
    this.db = db;
    this.graph = {
      entities: new Map(),
      relationships: new Map(),
      entityIndices: new Map(),
      relationshipIndices: new Map(),
      projectGraphs: new Map()
    };
  }
  
  async initialize(): Promise<void> {
    // Load entities from database
    const entityData = await this.db.knowledgeEntities.findAll();
    for (const data of entityData) {
      const entity: KnowledgeEntity = {
        id: data.uuid,
        type: data.type,
        name: data.name,
        properties: new Map(Object.entries(data.properties)),
        projectId: data.project_id,
        confidence: data.confidence,
        source: data.source,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.addEntityToMemory(entity);
    }
    
    // Load relationships from database
    const relationshipData = await this.db.knowledgeRelationships.findAll();
    for (const data of relationshipData) {
      const relationship: KnowledgeRelationship = {
        id: data.uuid,
        type: data.type,
        sourceEntityId: data.source_entity_id,
        targetEntityId: data.target_entity_id,
        properties: new Map(Object.entries(data.properties)),
        projectId: data.project_id,
        confidence: data.confidence,
        source: data.source,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.addRelationshipToMemory(relationship);
    }
  }
  
  async createEntity(entityData: Omit<KnowledgeEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Generate entity ID
    const entityId = uuidv4();
    
    // Create entity object
    const entity: KnowledgeEntity = {
      id: entityId,
      ...entityData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validate entity
    this.validateEntity(entity);
    
    // Add to memory
    this.addEntityToMemory(entity);
    
    // Store in database
    await this.db.knowledgeEntities.create({
      uuid: entityId,
      type: entity.type,
      name: entity.name,
      properties: Object.fromEntries(entity.properties),
      project_id: entity.projectId,
      confidence: entity.confidence,
      source: entity.source,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      metadata: Object.fromEntries(entity.metadata)
    });
    
    return entityId;
  }
  
  async createRelationship(relationshipData: Omit<KnowledgeRelationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Check if source and target entities exist
    if (!this.graph.entities.has(relationshipData.sourceEntityId)) {
      throw new Error(`Source entity ${relationshipData.sourceEntityId} not found`);
    }
    if (!this.graph.entities.has(relationshipData.targetEntityId)) {
      throw new Error(`Target entity ${relationshipData.targetEntityId} not found`);
    }
    
    // Generate relationship ID
    const relationshipId = uuidv4();
    
    // Create relationship object
    const relationship: KnowledgeRelationship = {
      id: relationshipId,
      ...relationshipData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validate relationship
    this.validateRelationship(relationship);
    
    // Add to memory
    this.addRelationshipToMemory(relationship);
    
    // Store in database
    await this.db.knowledgeRelationships.create({
      uuid: relationshipId,
      type: relationship.type,
      source_entity_id: relationship.sourceEntityId,
      target_entity_id: relationship.targetEntityId,
      properties: Object.fromEntries(relationship.properties),
      project_id: relationship.projectId,
      confidence: relationship.confidence,
      source: relationship.source,
      created_at: relationship.createdAt,
      updated_at: relationship.updatedAt,
      metadata: Object.fromEntries(relationship.metadata)
    });
    
    return relationshipId;
  }
  
  async getEntity(entityId: string): Promise<KnowledgeEntity> {
    // Check in memory
    if (this.graph.entities.has(entityId)) {
      return this.graph.entities.get(entityId);
    }
    
    // Get from database
    const entityData = await this.db.knowledgeEntities.findByUuid(entityId);
    if (!entityData) {
      throw new Error(`Entity ${entityId} not found`);
    }
    
    // Convert to KnowledgeEntity object
    const entity: KnowledgeEntity = {
      id: entityData.uuid,
      type: entityData.type,
      name: entityData.name,
      properties: new Map(Object.entries(entityData.properties)),
      projectId: entityData.project_id,
      confidence: entityData.confidence,
      source: entityData.source,
      createdAt: entityData.created_at,
      updatedAt: entityData.updated_at,
      metadata: new Map(Object.entries(entityData.metadata || {}))
    };
    
    // Add to memory
    this.addEntityToMemory(entity);
    
    return entity;
  }
  
  async getRelationship(relationshipId: string): Promise<KnowledgeRelationship> {
    // Check in memory
    if (this.graph.relationships.has(relationshipId)) {
      return this.graph.relationships.get(relationshipId);
    }
    
    // Get from database
    const relationshipData = await this.db.knowledgeRelationships.findByUuid(relationshipId);
    if (!relationshipData) {
      throw new Error(`Relationship ${relationshipId} not found`);
    }
    
    // Convert to KnowledgeRelationship object
    const relationship: KnowledgeRelationship = {
      id: relationshipData.uuid,
      type: relationshipData.type,
      sourceEntityId: relationshipData.source_entity_id,
      targetEntityId: relationshipData.target_entity_id,
      properties: new Map(Object.entries(relationshipData.properties)),
      projectId: relationshipData.project_id,
      confidence: relationshipData.confidence,
      source: relationshipData.source,
      createdAt: relationshipData.created_at,
      updatedAt: relationshipData.updated_at,
      metadata: new Map(Object.entries(relationshipData.metadata || {}))
    };
    
    // Add to memory
    this.addRelationshipToMemory(relationship);
    
    return relationship;
  }
  
  async updateEntity(entityId: string, updates: Partial<KnowledgeEntity>): Promise<void> {
    // Get current entity
    const entity = await this.getEntity(entityId);
    
    // Apply updates
    const updatedEntity: KnowledgeEntity = {
      ...entity,
      ...updates,
      id: entity.id, // Ensure ID doesn't change
      createdAt: entity.createdAt, // Ensure creation timestamp doesn't change
      updatedAt: new Date(), // Update timestamp
      properties: new Map([...entity.properties, ...(updates.properties || new Map())]),
      metadata: new Map([...entity.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated entity
    this.validateEntity(updatedEntity);
    
    // Check if type changed
    if (updates.type && updates.type !== entity.type) {
      // Remove from old type index
      const oldTypeEntities = this.graph.entityIndices.get(entity.type) || new Set();
      oldTypeEntities.delete(entityId);
      this.graph.entityIndices.set(entity.type, oldTypeEntities);
      
      // Add to new type index
      const newTypeEntities = this.graph.entityIndices.get(updatedEntity.type) || new Set();
      newTypeEntities.add(entityId);
      this.graph.entityIndices.set(updatedEntity.type, newTypeEntities);
    }
    
    // Check if project changed
    if (updates.projectId && updates.projectId !== entity.projectId) {
      // Remove from old project
      if (entity.projectId) {
        const oldProjectEntities = this.graph.projectGraphs.get(entity.projectId) || new Set();
        oldProjectEntities.delete(entityId);
        this.graph.projectGraphs.set(entity.projectId, oldProjectEntities);
      }
      
      // Add to new project
      if (updatedEntity.projectId) {
        const newProjectEntities = this.graph.projectGraphs.get(updatedEntity.projectId) || new Set();
        newProjectEntities.add(entityId);
        this.graph.projectGraphs.set(updatedEntity.projectId, newProjectEntities);
      }
    }
    
    // Update in memory
    this.graph.entities.set(entityId, updatedEntity);
    
    // Update in database
    await this.db.knowledgeEntities.update(entityId, {
      type: updatedEntity.type,
      name: updatedEntity.name,
      properties: Object.fromEntries(updatedEntity.properties),
      project_id: updatedEntity.projectId,
      confidence: updatedEntity.confidence,
      source: updatedEntity.source,
      updated_at: updatedEntity.updatedAt,
      metadata: Object.fromEntries(updatedEntity.metadata)
    });
  }
  
  async updateRelationship(relationshipId: string, updates: Partial<KnowledgeRelationship>): Promise<void> {
    // Get current relationship
    const relationship = await this.getRelationship(relationshipId);
    
    // Apply updates
    const updatedRelationship: KnowledgeRelationship = {
      ...relationship,
      ...updates,
      id: relationship.id, // Ensure ID doesn't change
      createdAt: relationship.createdAt, // Ensure creation timestamp doesn't change
      updatedAt: new Date(), // Update timestamp
      properties: new Map([...relationship.properties, ...(updates.properties || new Map())]),
      metadata: new Map([...relationship.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated relationship
    this.validateRelationship(updatedRelationship);
    
    // Check if type changed
    if (updates.type && updates.type !== relationship.type) {
      // Remove from old type index
      const oldTypeRelationships = this.graph.relationshipIndices.get(relationship.type) || new Set();
      oldTypeRelationships.delete(relationshipId);
      this.graph.relationshipIndices.set(relationship.type, oldTypeRelationships);
      
      // Add to new type index
      const newTypeRelationships = this.graph.relationshipIndices.get(updatedRelationship.type) || new Set();
      newTypeRelationships.add(relationshipId);
      this.graph.relationshipIndices.set(updatedRelationship.type, newTypeRelationships);
    }
    
    // Check if project changed
    if (updates.projectId && updates.projectId !== relationship.projectId) {
      // Remove from old project
      if (relationship.projectId) {
        const oldProjectRelationships = this.graph.projectGraphs.get(relationship.projectId) || new Set();
        oldProjectRelationships.delete(relationshipId);
        this.graph.projectGraphs.set(relationship.projectId, oldProjectRelationships);
      }
      
      // Add to new project
      if (updatedRelationship.projectId) {
        const newProjectRelationships = this.graph.projectGraphs.get(updatedRelationship.projectId) || new Set();
        newProjectRelationships.add(relationshipId);
        this.graph.projectGraphs.set(updatedRelationship.projectId, newProjectRelationships);
      }
    }
    
    // Update in memory
    this.graph.relationships.set(relationshipId, updatedRelationship);
    
    // Update in database
    await this.db.knowledgeRelationships.update(relationshipId, {
      type: updatedRelationship.type,
      source_entity_id: updatedRelationship.sourceEntityId,
      target_entity_id: updatedRelationship.targetEntityId,
      properties: Object.fromEntries(updatedRelationship.properties),
      project_id: updatedRelationship.projectId,
      confidence: updatedRelationship.confidence,
      source: updatedRelationship.source,
      updated_at: updatedRelationship.updatedAt,
      metadata: Object.fromEntries(updatedRelationship.metadata)
    });
  }
  
  async deleteEntity(entityId: string): Promise<void> {
    // Get entity
    const entity = await this.getEntity(entityId);
    
    // Check if entity has relationships
    const relationships = await this.getRelationshipsForEntity(entityId);
    if (relationships.length > 0) {
      throw new Error(`Cannot delete entity ${entityId} because it has ${relationships.length} relationships`);
    }
    
    // Remove from memory
    this.graph.entities.delete(entityId);
    
    // Remove from type index
    const typeEntities = this.graph.entityIndices.get(entity.type) || new Set();
    typeEntities.delete(entityId);
    this.graph.entityIndices.set(entity.type, typeEntities);
    
    // Remove from project
    if (entity.projectId) {
      const projectEntities = this.graph.projectGraphs.get(entity.projectId) || new Set();
      projectEntities.delete(entityId);
      this.graph.projectGraphs.set(entity.projectId, projectEntities);
    }
    
    // Remove from database
    await this.db.knowledgeEntities.delete(entityId);
  }
  
  async deleteRelationship(relationshipId: string): Promise<void> {
    // Get relationship
    const relationship = await this.getRelationship(relationshipId);
    
    // Remove from memory
    this.graph.relationships.delete(relationshipId);
    
    // Remove from type index
    const typeRelationships = this.graph.relationshipIndices.get(relationship.type) || new Set();
    typeRelationships.delete(relationshipId);
    this.graph.relationshipIndices.set(relationship.type, typeRelationships);
    
    // Remove from project
    if (relationship.projectId) {
      const projectRelationships = this.graph.projectGraphs.get(relationship.projectId) || new Set();
      projectRelationships.delete(relationshipId);
      this.graph.projectGraphs.set(relationship.projectId, projectRelationships);
    }
    
    // Remove from database
    await this.db.knowledgeRelationships.delete(relationshipId);
  }
  
  async queryEntities(query: KnowledgeQuery): Promise<KnowledgeEntity[]> {
    // Start with all entities
    let entityIds: string[] = Array.from(this.graph.entities.keys());
    
    // Filter by entity types
    if (query.entityTypes && query.entityTypes.length > 0) {
      const typeEntityIds: string[] = [];
      for (const type of query.entityTypes) {
        const typeEntities = this.graph.entityIndices.get(type) || new Set();
        typeEntityIds.push(...Array.from(typeEntities));
      }
      entityIds = entityIds.filter(id => typeEntityIds.includes(id));
    }
    
    // Filter by project
    if (query.projectId) {
      const projectEntities = this.graph.projectGraphs.get(query.projectId) || new Set();
      entityIds = entityIds.filter(id => projectEntities.has(id));
    }
    
    // Get entities
    const entities: KnowledgeEntity[] = await Promise.all(
      entityIds.map(id => this.getEntity(id))
    );
    
    // Filter by properties
    if (query.properties && query.properties.size > 0) {
      const filteredEntities: KnowledgeEntity[] = [];
      
      for (const entity of entities) {
        let matches = true;
        
        for (const [key, value] of query.properties.entries()) {
          if (!entity.properties.has(key) || entity.properties.get(key) !== value) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          filteredEntities.push(entity);
        }
      }
      
      return filteredEntities;
    }
    
    // Filter by confidence threshold
    if (query.confidenceThreshold !== undefined) {
      entities.filter(e => e.confidence >= query.confidenceThreshold);
    }
    
    // Sort results
    if (query.orderBy) {
      entities.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        if (query.orderBy === 'name') {
          valueA = a.name;
          valueB = b.name;
        } else if (query.orderBy === 'type') {
          valueA = a.type;
          valueB = b.type;
        } else if (query.orderBy === 'confidence') {
          valueA = a.confidence;
          valueB = b.confidence;
        } else if (query.orderBy === 'createdAt') {
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
        } else if (query.orderBy === 'updatedAt') {
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
        } else if (a.properties.has(query.orderBy) && b.properties.has(query.orderBy)) {
          valueA = a.properties.get(query.orderBy);
          valueB = b.properties.get(query.orderBy);
        } else {
          return 0;
        }
        
        if (valueA === valueB) return 0;
        
        const direction = query.orderDirection === 'desc' ? -1 : 1;
        return valueA < valueB ? -1 * direction : 1 * direction;
      });
    }
    
    // Apply limit and offset
    if (query.offset !== undefined || query.limit !== undefined) {
      const offset = query.offset || 0;
      const limit = query.limit !== undefined ? query.limit : entities.length;
      return entities.slice(offset, offset + limit);
    }
    
    return entities;
  }
  
  async queryRelationships(query: KnowledgeQuery): Promise<KnowledgeRelationship[]> {
    // Start with all relationships
    let relationshipIds: string[] = Array.from(this.graph.relationships.keys());
    
    // Filter by relationship types
    if (query.relationshipTypes && query.relationshipTypes.length > 0) {
      const typeRelationshipIds: string[] = [];
      for (const type of query.relationshipTypes) {
        const typeRelationships = this.graph.relationshipIndices.get(type) || new Set();
        typeRelationshipIds.push(...Array.from(typeRelationships));
      }
      relationshipIds = relationshipIds.filter(id => typeRelationshipIds.includes(id));
    }
    
    // Filter by project
    if (query.projectId) {
      const projectRelationships = this.graph.projectGraphs.get(query.projectId) || new Set();
      relationshipIds = relationshipIds.filter(id => projectRelationships.has(id));
    }
    
    // Get relationships
    const relationships: KnowledgeRelationship[] = await Promise.all(
      relationshipIds.map(id => this.getRelationship(id))
    );
    
    // Filter by properties
    if (query.properties && query.properties.size > 0) {
      const filteredRelationships: KnowledgeRelationship[] = [];
      
      for (const relationship of relationships) {
        let matches = true;
        
        for (const [key, value] of query.properties.entries()) {
          if (!relationship.properties.has(key) || relationship.properties.get(key) !== value) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          filteredRelationships.push(relationship);
        }
      }
      
      return filteredRelationships;
    }
    
    // Filter by confidence threshold
    if (query.confidenceThreshold !== undefined) {
      relationships.filter(r => r.confidence >= query.confidenceThreshold);
    }
    
    // Sort results
    if (query.orderBy) {
      relationships.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        if (query.orderBy === 'type') {
          valueA = a.type;
          valueB = b.type;
        } else if (query.orderBy === 'confidence') {
          valueA = a.confidence;
          valueB = b.confidence;
        } else if (query.orderBy === 'createdAt') {
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
        } else if (query.orderBy === 'updatedAt') {
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
        } else if (a.properties.has(query.orderBy) && b.properties.has(query.orderBy)) {
          valueA = a.properties.get(query.orderBy);
          valueB = b.properties.get(query.orderBy);
        } else {
          return 0;
        }
        
        if (valueA === valueB) return 0;
        
        const direction = query.orderDirection === 'desc' ? -1 : 1;
        return valueA < valueB ? -1 * direction : 1 * direction;
      });
    }
    
    // Apply limit and offset
    if (query.offset !== undefined || query.limit !== undefined) {
      const offset = query.offset || 0;
      const limit = query.limit !== undefined ? query.limit : relationships.length;
      return relationships.slice(offset, offset + limit);
    }
    
    return relationships;
  }
  
  async getRelationshipsForEntity(entityId: string): Promise<KnowledgeRelationship[]> {
    // Get all relationships where entity is source or target
    const relationships: KnowledgeRelationship[] = [];
    
    for (const relationship of this.graph.relationships.values()) {
      if (relationship.sourceEntityId === entityId || relationship.targetEntityId === entityId) {
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }
  
  async getRelatedEntities(entityId: string, relationshipType?: string, direction: 'outgoing' | 'incoming' | 'both' = 'both'): Promise<KnowledgeEntity[]> {
    // Get relationships for entity
    const relationships = await this.getRelationshipsForEntity(entityId);
    
    // Filter by relationship type
    const filteredRelationships = relationshipType
      ? relationships.filter(r => r.type === relationshipType)
      : relationships;
    
    // Get related entity IDs based on direction
    const relatedEntityIds: string[] = [];
    
    for (const relationship of filteredRelationships) {
      if (direction === 'outgoing' || direction === 'both') {
        if (relationship.sourceEntityId === entityId) {
          relatedEntityIds.push(relationship.targetEntityId);
        }
      }
      
      if (direction === 'incoming' || direction === 'both') {
        if (relationship.targetEntityId === entityId) {
          relatedEntityIds.push(relationship.sourceEntityId);
        }
      }
    }
    
    // Get entities
    const entities: KnowledgeEntity[] = await Promise.all(
      relatedEntityIds.map(id => this.getEntity(id))
    );
    
    return entities;
  }
  
  async findPaths(
    sourceEntityId: string,
    targetEntityId: string,
    maxDepth: number = 5,
    relationshipTypes?: string[]
  ): Promise<KnowledgePath[]> {
    // Check if source and target entities exist
    if (!this.graph.entities.has(sourceEntityId)) {
      throw new Error(`Source entity ${sourceEntityId} not found`);
    }
    if (!this.graph.entities.has(targetEntityId)) {
      throw new Error(`Target entity ${targetEntityId} not found`);
    }
    
    // Initialize paths
    const paths: KnowledgePath[] = [];
    
    // Perform breadth-first search
    const queue: Array<{
      path: string[];
      relationships: string[];
    }> = [
      {
        path: [sourceEntityId],
        relationships: []
      }
    ];
    
    const visited = new Set<string>();
    visited.add(sourceEntityId);
    
    while (queue.length > 0) {
      const current = queue.shift();
      const currentEntityId = current.path[current.path.length - 1];
      
      // Check if we've reached the target
      if (currentEntityId === targetEntityId) {
        // Construct path
        const entities: KnowledgeEntity[] = await Promise.all(
          current.path.map(id => this.getEntity(id))
        );
        
        const relationships: KnowledgeRelationship[] = await Promise.all(
          current.relationships.map(id => this.getRelationship(id))
        );
        
        // Calculate path confidence
        const confidence = this.calculatePathConfidence(entities, relationships);
        
        paths.push({
          entities,
          relationships,
          confidence
        });
        
        continue;
      }
      
      // Check if we've reached max depth
      if (current.path.length > maxDepth) {
        continue;
      }
      
      // Get relationships for current entity
      const relationships = await this.getRelationshipsForEntity(currentEntityId);
      
      // Filter by relationship types
      const filteredRelationships = relationshipTypes
        ? relationships.filter(r => relationshipTypes.includes(r.type))
        : relationships;
      
      // Add neighbors to queue
      for (const relationship of filteredRelationships) {
        let nextEntityId: string;
        
        if (relationship.sourceEntityId === currentEntityId) {
          nextEntityId = relationship.targetEntityId;
        } else if (relationship.targetEntityId === currentEntityId) {
          nextEntityId = relationship.sourceEntityId;
        } else {
          continue;
        }
        
        // Skip if already visited
        if (visited.has(nextEntityId)) {
          continue;
        }
        
        // Add to queue
        queue.push({
          path: [...current.path, nextEntityId],
          relationships: [...current.relationships, relationship.id]
        });
        
        // Mark as visited
        visited.add(nextEntityId);
      }
    }
    
    // Sort paths by confidence
    paths.sort((a, b) => b.confidence - a.confidence);
    
    return paths;
  }
  
  private addEntityToMemory(entity: KnowledgeEntity): void {
    // Add to entities map
    this.graph.entities.set(entity.id, entity);
    
    // Add to type index
    if (!this.graph.entityIndices.has(entity.type)) {
      this.graph.entityIndices
