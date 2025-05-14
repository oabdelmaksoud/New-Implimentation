# Continuous Learning System

## Overview

The Continuous Learning System component is a critical part of the Knowledge Management and Learning phase. It enables agents to continuously improve their knowledge, adapt to new information, and refine their capabilities over time. This document outlines the detailed implementation plan for the Continuous Learning System.

## Objectives

- Implement continuous knowledge acquisition
- Create knowledge refinement mechanisms
- Develop feedback-based learning
- Implement performance improvement tracking

## Tasks

1. **Knowledge Acquisition Pipeline**
   - Implement data ingestion from multiple sources
   - Create knowledge extraction
   - Develop knowledge validation
   - Implement knowledge integration

2. **Feedback Processing System**
   - Create user feedback collection
   - Implement agent self-assessment
   - Develop peer feedback mechanisms
   - Create feedback analysis

3. **Learning Loop Implementation**
   - Implement performance monitoring
   - Create knowledge gap identification
   - Develop learning prioritization
   - Implement learning scheduling

4. **Knowledge Refinement**
   - Create knowledge conflict resolution
   - Implement knowledge obsolescence detection
   - Develop knowledge consolidation
   - Create knowledge versioning

## Micro-Level Implementation Details

### Continuous Learning Framework

```typescript
// Learning Source
interface LearningSource {
  id: string;                     // Unique source ID
  name: string;                   // Human-readable name
  type: LearningSourceType;       // Source type
  priority: number;               // Priority (1-10)
  trustScore: number;             // Trust score (0-1)
  metadata: Map<string, any>;     // Additional metadata
}

// Learning Source Type
enum LearningSourceType {
  USER_FEEDBACK = 'user_feedback',
  SYSTEM_FEEDBACK = 'system_feedback',
  PEER_AGENT = 'peer_agent',
  EXTERNAL_API = 'external_api',
  DOCUMENT = 'document',
  OBSERVATION = 'observation',
  EXPERIMENT = 'experiment'
}

// Learning Item
interface LearningItem {
  id: string;                     // Unique item ID
  sourceId: string;               // Source ID
  timestamp: Date;                // Creation timestamp
  content: any;                   // Learning content
  contentType: string;            // Content type
  priority: number;               // Priority (1-10)
  status: LearningItemStatus;     // Processing status
  metadata: Map<string, any>;     // Additional metadata
}

// Learning Item Status
enum LearningItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  INTEGRATED = 'integrated',
  ARCHIVED = 'archived'
}

// Knowledge Update
interface KnowledgeUpdate {
  id: string;                     // Unique update ID
  learningItemId: string;         // Learning item ID
  entityIds: string[];            // Affected entity IDs
  relationshipIds: string[];      // Affected relationship IDs
  updateType: UpdateType;         // Update type
  timestamp: Date;                // Update timestamp
  changes: Map<string, any>;      // Changes made
  confidence: number;             // Confidence score (0-1)
  metadata: Map<string, any>;     // Additional metadata
}

// Update Type
enum UpdateType {
  ADD = 'add',
  MODIFY = 'modify',
  DELETE = 'delete',
  MERGE = 'merge',
  SPLIT = 'split'
}

// Learning Feedback
interface LearningFeedback {
  id: string;                     // Unique feedback ID
  learningItemId: string;         // Learning item ID
  sourceId: string;               // Feedback source ID
  timestamp: Date;                // Feedback timestamp
  rating: number;                 // Rating (-1 to 1)
  comments: string;               // Feedback comments
  metadata: Map<string, any>;     // Additional metadata
}

// Learning Metric
interface LearningMetric {
  id: string;                     // Unique metric ID
  name: string;                   // Metric name
  description: string;            // Metric description
  value: number;                  // Current value
  targetValue: number;            // Target value
  unit: string;                   // Measurement unit
  timestamp: Date;                // Last update timestamp
  history: MetricHistoryEntry[];  // Value history
  metadata: Map<string, any>;     // Additional metadata
}

// Metric History Entry
interface MetricHistoryEntry {
  timestamp: Date;                // Entry timestamp
  value: number;                  // Metric value
  event?: string;                 // Associated event
}

// Learning Goal
interface LearningGoal {
  id: string;                     // Unique goal ID
  name: string;                   // Goal name
  description: string;            // Goal description
  priority: number;               // Priority (1-10)
  status: GoalStatus;             // Goal status
  progress: number;               // Progress percentage (0-100)
  startDate: Date;                // Start date
  targetDate: Date;               // Target completion date
  completedDate?: Date;           // Completion date
  metrics: string[];              // Associated metric IDs
  dependencies: string[];         // Dependent goal IDs
  metadata: Map<string, any>;     // Additional metadata
}

// Goal Status
enum GoalStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Learning Session
interface LearningSession {
  id: string;                     // Unique session ID
  agentId: string;                // Agent ID
  goalId: string;                 // Learning goal ID
  startTime: Date;                // Session start time
  endTime?: Date;                 // Session end time
  status: SessionStatus;          // Session status
  learningItems: string[];        // Learning item IDs
  metrics: Map<string, number>;   // Metrics before/after
  notes: string;                  // Session notes
  metadata: Map<string, any>;     // Additional metadata
}

// Session Status
enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  FAILED = 'failed'
}
```

### Continuous Learning Manager

```typescript
// Continuous Learning Manager
class ContinuousLearningManager {
  private db: Database;
  private knowledgeGraph: KnowledgeGraphManager;
  private sources: Map<string, LearningSource>;
  private learningItems: Map<string, LearningItem>;
  private knowledgeUpdates: Map<string, KnowledgeUpdate>;
  private learningGoals: Map<string, LearningGoal>;
  private learningMetrics: Map<string, LearningMetric>;
  private learningSessions: Map<string, LearningSession>;
  
  constructor(db: Database, knowledgeGraph: KnowledgeGraphManager) {
    this.db = db;
    this.knowledgeGraph = knowledgeGraph;
    this.sources = new Map();
    this.learningItems = new Map();
    this.knowledgeUpdates = new Map();
    this.learningGoals = new Map();
    this.learningMetrics = new Map();
    this.learningSessions = new Map();
  }
  
  async initialize(): Promise<void> {
    // Load learning sources
    const sourceData = await this.db.learningSources.findAll();
    for (const data of sourceData) {
      const source: LearningSource = {
        id: data.uuid,
        name: data.name,
        type: data.type as LearningSourceType,
        priority: data.priority,
        trustScore: data.trust_score,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.sources.set(source.id, source);
    }
    
    // Load learning items
    const itemData = await this.db.learningItems.findAll();
    for (const data of itemData) {
      const item: LearningItem = {
        id: data.uuid,
        sourceId: data.source_id,
        timestamp: data.timestamp,
        content: data.content,
        contentType: data.content_type,
        priority: data.priority,
        status: data.status as LearningItemStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.learningItems.set(item.id, item);
    }
    
    // Load knowledge updates
    const updateData = await this.db.knowledgeUpdates.findAll();
    for (const data of updateData) {
      const update: KnowledgeUpdate = {
        id: data.uuid,
        learningItemId: data.learning_item_id,
        entityIds: data.entity_ids,
        relationshipIds: data.relationship_ids,
        updateType: data.update_type as UpdateType,
        timestamp: data.timestamp,
        changes: new Map(Object.entries(data.changes)),
        confidence: data.confidence,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.knowledgeUpdates.set(update.id, update);
    }
    
    // Load learning goals
    const goalData = await this.db.learningGoals.findAll();
    for (const data of goalData) {
      const goal: LearningGoal = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        priority: data.priority,
        status: data.status as GoalStatus,
        progress: data.progress,
        startDate: data.start_date,
        targetDate: data.target_date,
        completedDate: data.completed_date,
        metrics: data.metrics,
        dependencies: data.dependencies,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.learningGoals.set(goal.id, goal);
    }
    
    // Load learning metrics
    const metricData = await this.db.learningMetrics.findAll();
    for (const data of metricData) {
      const metric: LearningMetric = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        value: data.value,
        targetValue: data.target_value,
        unit: data.unit,
        timestamp: data.timestamp,
        history: data.history,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.learningMetrics.set(metric.id, metric);
    }
    
    // Load learning sessions
    const sessionData = await this.db.learningSessions.findAll();
    for (const data of sessionData) {
      const session: LearningSession = {
        id: data.uuid,
        agentId: data.agent_id,
        goalId: data.goal_id,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status as SessionStatus,
        learningItems: data.learning_items,
        metrics: new Map(Object.entries(data.metrics)),
        notes: data.notes,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.learningSessions.set(session.id, session);
    }
  }
  
  async registerLearningSource(sourceData: Omit<LearningSource, 'id'>): Promise<string> {
    // Generate source ID
    const sourceId = uuidv4();
    
    // Create source object
    const source: LearningSource = {
      id: sourceId,
      ...sourceData
    };
    
    // Validate source
    this.validateLearningSource(source);
    
    // Add to memory
    this.sources.set(sourceId, source);
    
    // Store in database
    await this.db.learningSources.create({
      uuid: sourceId,
      name: source.name,
      type: source.type,
      priority: source.priority,
      trust_score: source.trustScore,
      metadata: Object.fromEntries(source.metadata)
    });
    
    return sourceId;
  }
  
  async submitLearningItem(itemData: Omit<LearningItem, 'id' | 'timestamp' | 'status'>): Promise<string> {
    // Check if source exists
    if (!this.sources.has(itemData.sourceId)) {
      throw new Error(`Learning source ${itemData.sourceId} not found`);
    }
    
    // Generate item ID
    const itemId = uuidv4();
    
    // Create item object
    const item: LearningItem = {
      id: itemId,
      ...itemData,
      timestamp: new Date(),
      status: LearningItemStatus.PENDING
    };
    
    // Validate item
    this.validateLearningItem(item);
    
    // Add to memory
    this.learningItems.set(itemId, item);
    
    // Store in database
    await this.db.learningItems.create({
      uuid: itemId,
      source_id: item.sourceId,
      timestamp: item.timestamp,
      content: item.content,
      content_type: item.contentType,
      priority: item.priority,
      status: item.status,
      metadata: Object.fromEntries(item.metadata)
    });
    
    // Queue for processing
    await this.queueLearningItemForProcessing(itemId);
    
    return itemId;
  }
  
  async processLearningItem(itemId: string): Promise<void> {
    // Get learning item
    const item = await this.getLearningItem(itemId);
    
    // Update status
    item.status = LearningItemStatus.PROCESSING;
    await this.updateLearningItemStatus(itemId, LearningItemStatus.PROCESSING);
    
    try {
      // Process based on content type
      switch (item.contentType) {
        case 'text/plain':
        case 'text/markdown':
          await this.processTextContent(item);
          break;
        
        case 'application/json':
          await this.processJsonContent(item);
          break;
        
        case 'feedback':
          await this.processFeedbackContent(item);
          break;
        
        case 'observation':
          await this.processObservationContent(item);
          break;
        
        default:
          throw new Error(`Unsupported content type: ${item.contentType}`);
      }
      
      // Update status to validated
      await this.updateLearningItemStatus(itemId, LearningItemStatus.VALIDATED);
      
      // Integrate knowledge
      await this.integrateKnowledge(itemId);
      
      // Update status to integrated
      await this.updateLearningItemStatus(itemId, LearningItemStatus.INTEGRATED);
    } catch (error) {
      // Update status to rejected
      await this.updateLearningItemStatus(itemId, LearningItemStatus.REJECTED);
      
      // Log error
      console.error(`Error processing learning item ${itemId}:`, error);
      
      // Add error to metadata
      item.metadata.set('processingError', error.message);
      await this.updateLearningItem(itemId, { metadata: item.metadata });
    }
  }
  
  async integrateKnowledge(itemId: string): Promise<string[]> {
    // Get learning item
    const item = await this.getLearningItem(itemId);
    
    // Check if item is validated
    if (item.status !== LearningItemStatus.VALIDATED) {
      throw new Error(`Cannot integrate knowledge from learning item ${itemId} because it is not validated`);
    }
    
    // Get source
    const source = await this.getLearningSource(item.sourceId);
    
    // Create knowledge updates
    const updateIds: string[] = [];
    
    // Process based on content type
    switch (item.contentType) {
      case 'text/plain':
      case 'text/markdown':
        // Extract entities and relationships from text
        const extractedKnowledge = await this.extractKnowledgeFromText(item.content);
        
        // Create updates for each entity and relationship
        for (const entity of extractedKnowledge.entities) {
          const updateId = await this.createKnowledgeUpdate({
            learningItemId: itemId,
            entityIds: [entity.id],
            relationshipIds: [],
            updateType: UpdateType.ADD,
            changes: new Map(Object.entries(entity)),
            confidence: source.trustScore * 0.8 // Reduce confidence for extracted knowledge
          });
          
          updateIds.push(updateId);
        }
        
        for (const relationship of extractedKnowledge.relationships) {
          const updateId = await this.createKnowledgeUpdate({
            learningItemId: itemId,
            entityIds: [],
            relationshipIds: [relationship.id],
            updateType: UpdateType.ADD,
            changes: new Map(Object.entries(relationship)),
            confidence: source.trustScore * 0.7 // Further reduce confidence for relationships
          });
          
          updateIds.push(updateId);
        }
        break;
      
      case 'application/json':
        // Parse JSON content
        const jsonContent = typeof item.content === 'string'
          ? JSON.parse(item.content)
          : item.content;
        
        // Create updates based on JSON structure
        if (jsonContent.entities) {
          for (const entity of jsonContent.entities) {
            const updateId = await this.createKnowledgeUpdate({
              learningItemId: itemId,
              entityIds: [entity.id],
              relationshipIds: [],
              updateType: entity.updateType || UpdateType.ADD,
              changes: new Map(Object.entries(entity)),
              confidence: source.trustScore * 0.9 // Higher confidence for structured data
            });
            
            updateIds.push(updateId);
          }
        }
        
        if (jsonContent.relationships) {
          for (const relationship of jsonContent.relationships) {
            const updateId = await this.createKnowledgeUpdate({
              learningItemId: itemId,
              entityIds: [],
              relationshipIds: [relationship.id],
              updateType: relationship.updateType || UpdateType.ADD,
              changes: new Map(Object.entries(relationship)),
              confidence: source.trustScore * 0.85
            });
            
            updateIds.push(updateId);
          }
        }
        break;
      
      case 'feedback':
        // Process feedback content
        const feedbackContent = typeof item.content === 'string'
          ? JSON.parse(item.content)
          : item.content;
        
        // Create updates based on feedback
        for (const feedback of feedbackContent.feedback) {
          if (feedback.entityId) {
            const updateId = await this.createKnowledgeUpdate({
              learningItemId: itemId,
              entityIds: [feedback.entityId],
              relationshipIds: [],
              updateType: UpdateType.MODIFY,
              changes: new Map(Object.entries(feedback.changes || {})),
              confidence: source.trustScore * (feedback.confidence || 0.8)
            });
            
            updateIds.push(updateId);
          }
          
          if (feedback.relationshipId) {
            const updateId = await this.createKnowledgeUpdate({
              learningItemId: itemId,
              entityIds: [],
              relationshipIds: [feedback.relationshipId],
              updateType: UpdateType.MODIFY,
              changes: new Map(Object.entries(feedback.changes || {})),
              confidence: source.trustScore * (feedback.confidence || 0.75)
            });
            
            updateIds.push(updateId);
          }
        }
        break;
      
      case 'observation':
        // Process observation content
        const observationContent = typeof item.content === 'string'
          ? JSON.parse(item.content)
          : item.content;
        
        // Create updates based on observation
        if (observationContent.entities) {
          for (const entity of observationContent.entities) {
            const updateId = await this.createKnowledgeUpdate({
              learningItemId: itemId,
              entityIds: [entity.id],
              relationshipIds: [],
              updateType: entity.exists ? UpdateType.MODIFY : UpdateType.ADD,
              changes: new Map(Object.entries(entity.properties || {})),
              confidence: source.trustScore * (entity.confidence || 0.85)
            });
            
            updateIds.push(updateId);
          }
        }
        
        if (observationContent.relationships) {
          for (const relationship of observationContent.relationships) {
            const updateId = await this.createKnowledgeUpdate({
              learningItemId: itemId,
              entityIds: [],
              relationshipIds: [relationship.id],
              updateType: relationship.exists ? UpdateType.MODIFY : UpdateType.ADD,
              changes: new Map(Object.entries(relationship.properties || {})),
              confidence: source.trustScore * (relationship.confidence || 0.8)
            });
            
            updateIds.push(updateId);
          }
        }
        break;
    }
    
    // Apply knowledge updates
    for (const updateId of updateIds) {
      await this.applyKnowledgeUpdate(updateId);
    }
    
    return updateIds;
  }
  
  async applyKnowledgeUpdate(updateId: string): Promise<void> {
    // Get knowledge update
    const update = await this.getKnowledgeUpdate(updateId);
    
    // Apply update based on type
    switch (update.updateType) {
      case UpdateType.ADD:
        // Add new entities or relationships
        for (const entityId of update.entityIds) {
          // Check if entity already exists
          try {
            await this.knowledgeGraph.getEntity(entityId);
            
            // Entity exists, modify instead
            await this.knowledgeGraph.updateEntity(entityId, Object.fromEntries(update.changes));
          } catch (error) {
            // Entity doesn't exist, create it
            const entityData = Object.fromEntries(update.changes);
            await this.knowledgeGraph.createEntity({
              ...entityData,
              id: entityId,
              confidence: update.confidence
            });
          }
        }
        
        for (const relationshipId of update.relationshipIds) {
          // Check if relationship already exists
          try {
            await this.knowledgeGraph.getRelationship(relationshipId);
            
            // Relationship exists, modify instead
            await this.knowledgeGraph.updateRelationship(relationshipId, Object.fromEntries(update.changes));
          } catch (error) {
            // Relationship doesn't exist, create it
            const relationshipData = Object.fromEntries(update.changes);
            await this.knowledgeGraph.createRelationship({
              ...relationshipData,
              id: relationshipId,
              confidence: update.confidence
            });
          }
        }
        break;
      
      case UpdateType.MODIFY:
        // Modify existing entities or relationships
        for (const entityId of update.entityIds) {
          await this.knowledgeGraph.updateEntity(entityId, Object.fromEntries(update.changes));
        }
        
        for (const relationshipId of update.relationshipIds) {
          await this.knowledgeGraph.updateRelationship(relationshipId, Object.fromEntries(update.changes));
        }
        break;
      
      case UpdateType.DELETE:
        // Delete entities or relationships
        for (const relationshipId of update.relationshipIds) {
          await this.knowledgeGraph.deleteRelationship(relationshipId);
        }
        
        for (const entityId of update.entityIds) {
          await this.knowledgeGraph.deleteEntity(entityId);
        }
        break;
      
      case UpdateType.MERGE:
        // Merge entities
        if (update.entityIds.length >= 2) {
          const targetEntityId = update.entityIds[0];
          const sourceEntityIds = update.entityIds.slice(1);
          
          // Get target entity
          const targetEntity = await this.knowledgeGraph.getEntity(targetEntityId);
          
          // Get source entities
          const sourceEntities = await Promise.all(
            sourceEntityIds.map(id => this.knowledgeGraph.getEntity(id))
          );
          
          // Merge properties
          for (const sourceEntity of sourceEntities) {
            for (const [key, value] of sourceEntity.properties.entries()) {
              if (!targetEntity.properties.has(key)) {
                targetEntity.properties.set(key, value);
              }
            }
          }
          
          // Update target entity
          await this.knowledgeGraph.updateEntity(targetEntityId, {
            properties: targetEntity.properties
          });
          
          // Get relationships for source entities
          for (const sourceEntityId of sourceEntityIds) {
            const relationships = await this.knowledgeGraph.getRelationshipsForEntity(sourceEntityId);
            
            // Update relationships to point to target entity
            for (const relationship of relationships) {
              if (relationship.sourceEntityId === sourceEntityId) {
                await this.knowledgeGraph.updateRelationship(relationship.id, {
                  sourceEntityId: targetEntityId
                });
              }
              
              if (relationship.targetEntityId === sourceEntityId) {
                await this.knowledgeGraph.updateRelationship(relationship.id, {
                  targetEntityId: targetEntityId
                });
              }
            }
            
            // Delete source entity
            await this.knowledgeGraph.deleteEntity(sourceEntityId);
          }
        }
        break;
      
      case UpdateType.SPLIT:
        // Split entity into multiple entities
        if (update.entityIds.length >= 2) {
          const sourceEntityId = update.entityIds[0];
          const targetEntityIds = update.entityIds.slice(1);
          
          // Get source entity
          const sourceEntity = await this.knowledgeGraph.getEntity(sourceEntityId);
          
          // Create target entities
          for (const targetEntityId of targetEntityIds) {
            // Get properties for this target entity from changes
            const targetProperties = new Map<string, any>();
            
            for (const [key, value] of update.changes.entries()) {
              if (key.startsWith(`${targetEntityId}.`)) {
                const propertyName = key.substring(targetEntityId.length + 1);
                targetProperties.set(propertyName, value);
              }
            }
            
            // Create target entity
            await this.knowledgeGraph.createEntity({
              id: targetEntityId,
              type: sourceEntity.type,
              name: targetProperties.get('name') || `${sourceEntity.name} (Split ${targetEntityIds.indexOf(targetEntityId) + 1})`,
              properties: targetProperties,
              confidence: update.confidence
            });
          }
          
          // Get relationships for source entity
          const relationships = await this.knowledgeGraph.getRelationshipsForEntity(sourceEntityId);
          
          // Determine which relationships go to which target entities
          for (const relationship of relationships) {
            // Get target entity ID for this relationship from changes
            let targetEntityId = null;
            
            for (const [key, value] of update.changes.entries()) {
              if (key === `relationship.${relationship.id}`) {
                targetEntityId = value;
                break;
              }
            }
            
            // If no target specified, use first target entity
            if (!targetEntityId) {
              targetEntityId = targetEntityIds[0];
            }
            
            // Update relationship
            if (relationship.sourceEntityId === sourceEntityId) {
              await this.knowledgeGraph.updateRelationship(relationship.id, {
                sourceEntityId: targetEntityId
              });
            }
            
            if (relationship.targetEntityId === sourceEntityId) {
              await this.knowledgeGraph.updateRelationship(relationship.id, {
                targetEntityId: targetEntityId
              });
            }
          }
          
          // Delete source entity
          await this.knowledgeGraph.deleteEntity(sourceEntityId);
        }
        break;
    }
  }
  
  async createLearningGoal(goalData: Omit<LearningGoal, 'id' | 'status' | 'progress' | 'startDate' | 'completedDate'>): Promise<string> {
    // Generate goal ID
    const goalId = uuidv4();
    
    // Create goal object
    const goal: LearningGoal = {
      id: goalId,
      ...goalData,
      status: GoalStatus.PLANNED,
      progress: 0,
      startDate: new Date(),
      completedDate: undefined
    };
    
    // Validate goal
    this.validateLearningGoal(goal);
    
    // Add to memory
    this.learningGoals.set(goalId, goal);
    
    // Store in database
    await this.db.learningGoals.create({
      uuid: goalId,
      name: goal.name,
      description: goal.description,
      priority: goal.priority,
      status: goal.status,
      progress: goal.progress,
      start_date: goal.startDate,
      target_date: goal.targetDate,
      completed_date: goal.completedDate,
      metrics: goal.metrics,
      dependencies: goal.dependencies,
      metadata: Object.fromEntries(goal.metadata)
    });
    
    return goalId;
  }
  
  async startLearningSession(agentId: string, goalId: string): Promise<string> {
    // Check if goal exists
    if (!this.learningGoals.has(goalId)) {
      throw new Error(`Learning goal ${goalId} not found`);
    }
    
    // Get goal
    const goal = this.learningGoals.get(goalId);
    
    // Check if goal is in appropriate status
    if (goal.status !== GoalStatus.PLANNED && goal.status !== GoalStatus.IN_PROGRESS) {
      throw new Error(`Cannot start learning session for goal ${goalId} because it is ${goal.status}`);
    }
    
    // Update goal status
    goal.status = GoalStatus.IN_PROGRESS;
    await this.updateLearningGoal(goalId, { status: GoalStatus.IN_PROGRESS });
    
    // Generate session ID
    const sessionId = uuidv4();
    
    // Get current metric values
    const metricValues = new Map<string, number>();
    for (const metricId of goal.metrics) {
      if (this.learningMetrics.has(metricId)) {
        const metric = this.learningMetrics.get(metricId);
        metricValues.set(metricId, metric.value);
      }
    }
    
    // Create session object
    const session: LearningSession = {
      id: sessionId,
      agentId,
      goalId,
      startTime: new Date(),
      status: SessionStatus.IN_PROGRESS,
      learningItems: [],
      metrics: metricValues,
      notes: '',
      metadata: new Map()
    };
    
    // Add to memory
    this.learningSessions.set(sessionId, session);
    
    // Store in database
    await this.db.learningSessions.create({
      uuid: sessionId,
      agent_id: session.agentId,
      goal_id: session.goalId,
      start_time: session.startTime,
      status: session.status,
      learning_items: session.learningItems,
      metrics: Object.fromEntries(session.metrics),
      notes: session.notes,
      metadata: Object.fromEntries(session.metadata)
    });
    
    return sessionId;
  }
  
  async endLearningSession(sessionId: string, success: boolean, notes: string): Promise<void> {
    // Get session
    const session = await this.getLearningSession(sessionId);
    
    // Check if session is in progress
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new Error(`Learning session ${sessionId} is
