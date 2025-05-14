# Task Sequence Management

## Overview

The Task Sequence Management component is a critical part of the Project-Specific Features phase. It enables the system to define, manage, and execute sequences of tasks with dependencies, conditions, and parallel execution paths. This document outlines the detailed implementation plan for the Task Sequence Management system.

## Objectives

- Implement task sequence definition and modeling
- Create task dependency management
- Develop conditional execution paths
- Implement parallel task execution

## Tasks

1. **Sequence Definition**
   - Implement sequence templates
   - Create task node definitions
   - Develop transition rules
   - Implement sequence validation

2. **Dependency Management**
   - Create dependency tracking
   - Implement blocking and non-blocking dependencies
   - Develop dependency resolution
   - Create circular dependency detection

3. **Execution Control**
   - Implement sequence execution engine
   - Create execution state management
   - Develop error handling and recovery
   - Implement execution monitoring

4. **Parallel Processing**
   - Create parallel execution branches
   - Implement synchronization points
   - Develop resource allocation
   - Create load balancing

## Micro-Level Implementation Details

### Task Sequence Structure

```typescript
// Task Node
interface TaskNode {
  id: string;                     // Unique node ID
  name: string;                   // Node name
  description: string;            // Node description
  type: TaskNodeType;             // Node type
  taskDefinitionId?: string;      // Task definition ID (for task nodes)
  parameters: Map<string, any>;   // Task parameters
  inputMappings: InputMapping[];  // Input mappings
  outputMappings: OutputMapping[]; // Output mappings
  timeoutSeconds: number;         // Timeout in seconds
  retryPolicy: RetryPolicy;       // Retry policy
  metadata: Map<string, any>;     // Additional metadata
}

// Task Node Type
enum TaskNodeType {
  TASK = 'task',
  START = 'start',
  END = 'end',
  DECISION = 'decision',
  FORK = 'fork',
  JOIN = 'join',
  SUBPROCESS = 'subprocess',
  WAIT = 'wait',
  TIMER = 'timer',
  SIGNAL = 'signal'
}

// Input Mapping
interface InputMapping {
  sourceNodeId: string;           // Source node ID
  sourceOutputName: string;       // Source output name
  targetInputName: string;        // Target input name
  transformation?: string;        // Optional transformation expression
}

// Output Mapping
interface OutputMapping {
  outputName: string;             // Output name
  valueExpression: string;        // Value expression
}

// Retry Policy
interface RetryPolicy {
  maxRetries: number;             // Maximum retry attempts
  retryIntervalSeconds: number;   // Initial retry interval
  backoffMultiplier: number;      // Backoff multiplier
  maxIntervalSeconds: number;     // Maximum retry interval
  retryableErrors: string[];      // Retryable error types
}

// Transition
interface Transition {
  id: string;                     // Unique transition ID
  name: string;                   // Transition name
  sourceNodeId: string;           // Source node ID
  targetNodeId: string;           // Target node ID
  condition?: string;             // Condition expression
  priority: number;               // Transition priority
  metadata: Map<string, any>;     // Additional metadata
}

// Task Sequence
interface TaskSequence {
  id: string;                     // Unique sequence ID
  name: string;                   // Sequence name
  description: string;            // Sequence description
  version: string;                // Sequence version
  projectId: string;              // Project ID
  nodes: TaskNode[];              // Task nodes
  transitions: Transition[];      // Transitions
  variables: SequenceVariable[];  // Sequence variables
  timeoutSeconds: number;         // Overall timeout in seconds
  status: SequenceStatus;         // Sequence status
  metadata: Map<string, any>;     // Additional metadata
}

// Sequence Variable
interface SequenceVariable {
  name: string;                   // Variable name
  type: string;                   // Variable type
  defaultValue?: any;             // Default value
  scope: VariableScope;           // Variable scope
  description: string;            // Variable description
}

// Variable Scope
enum VariableScope {
  SEQUENCE = 'sequence',
  NODE = 'node',
  GLOBAL = 'global'
}

// Sequence Status
enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

// Sequence Execution
interface SequenceExecution {
  id: string;                     // Unique execution ID
  sequenceId: string;             // Sequence ID
  projectId: string;              // Project ID
  startTime: Date;                // Start time
  endTime?: Date;                 // End time
  status: ExecutionStatus;        // Execution status
  currentNodeIds: string[];       // Current node IDs
  variables: Map<string, any>;    // Execution variables
  nodeExecutions: Map<string, NodeExecution>; // Node executions
  errors: ExecutionError[];       // Execution errors
  metadata: Map<string, any>;     // Additional metadata
}

// Node Execution
interface NodeExecution {
  nodeId: string;                 // Node ID
  status: ExecutionStatus;        // Execution status
  startTime: Date;                // Start time
  endTime?: Date;                 // End time
  attempts: number;               // Execution attempts
  inputs: Map<string, any>;       // Node inputs
  outputs: Map<string, any>;      // Node outputs
  error?: ExecutionError;         // Execution error
}

// Execution Status
enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMED_OUT = 'timed_out',
  WAITING = 'waiting'
}

// Execution Error
interface ExecutionError {
  code: string;                   // Error code
  message: string;                // Error message
  details?: any;                  // Error details
  timestamp: Date;                // Error timestamp
  nodeId?: string;                // Node ID (if applicable)
  retryable: boolean;             // Whether error is retryable
}
```

### Task Sequence Management System

```typescript
// Task Sequence Management System
class TaskSequenceManagementSystem {
  private db: Database;
  private sequences: Map<string, TaskSequence>;
  private executions: Map<string, SequenceExecution>;
  private executionEngine: SequenceExecutionEngine;
  
  constructor(db: Database) {
    this.db = db;
    this.sequences = new Map();
    this.executions = new Map();
    this.executionEngine = new SequenceExecutionEngine(this);
  }
  
  async initialize(): Promise<void> {
    // Load sequences from database
    const sequenceData = await this.db.taskSequences.findAll();
    for (const data of sequenceData) {
      const sequence: TaskSequence = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        version: data.version,
        projectId: data.project_id,
        nodes: data.nodes,
        transitions: data.transitions,
        variables: data.variables,
        timeoutSeconds: data.timeout_seconds,
        status: data.status as SequenceStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.sequences.set(sequence.id, sequence);
    }
    
    // Load active executions from database
    const executionData = await this.db.sequenceExecutions.findByStatus([
      ExecutionStatus.PENDING,
      ExecutionStatus.RUNNING,
      ExecutionStatus.WAITING
    ]);
    
    for (const data of executionData) {
      const execution: SequenceExecution = {
        id: data.uuid,
        sequenceId: data.sequence_id,
        projectId: data.project_id,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status as ExecutionStatus,
        currentNodeIds: data.current_node_ids,
        variables: new Map(Object.entries(data.variables || {})),
        nodeExecutions: new Map(Object.entries(data.node_executions || {}).map(
          ([nodeId, execData]) => [nodeId, {
            nodeId,
            status: execData.status,
            startTime: execData.start_time,
            endTime: execData.end_time,
            attempts: execData.attempts,
            inputs: new Map(Object.entries(execData.inputs || {})),
            outputs: new Map(Object.entries(execData.outputs || {})),
            error: execData.error
          }]
        )),
        errors: data.errors || [],
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.executions.set(execution.id, execution);
    }
    
    // Start execution engine
    this.executionEngine.start();
  }
  
  async createSequence(sequenceData: Omit<TaskSequence, 'id' | 'status'>): Promise<string> {
    // Generate sequence ID
    const sequenceId = uuidv4();
    
    // Create sequence object
    const sequence: TaskSequence = {
      id: sequenceId,
      ...sequenceData,
      status: SequenceStatus.DRAFT
    };
    
    // Validate sequence
    this.validateSequence(sequence);
    
    // Add to memory
    this.sequences.set(sequenceId, sequence);
    
    // Store in database
    await this.db.taskSequences.create({
      uuid: sequenceId,
      name: sequence.name,
      description: sequence.description,
      version: sequence.version,
      project_id: sequence.projectId,
      nodes: sequence.nodes,
      transitions: sequence.transitions,
      variables: sequence.variables,
      timeout_seconds: sequence.timeoutSeconds,
      status: sequence.status,
      metadata: Object.fromEntries(sequence.metadata)
    });
    
    return sequenceId;
  }
  
  async updateSequence(sequenceId: string, updates: Partial<TaskSequence>): Promise<void> {
    // Get sequence
    const sequence = await this.getSequence(sequenceId);
    
    // Check if sequence can be updated
    if (sequence.status === SequenceStatus.ARCHIVED) {
      throw new Error(`Cannot update archived sequence ${sequenceId}`);
    }
    
    // Apply updates
    const updatedSequence: TaskSequence = {
      ...sequence,
      ...updates,
      id: sequence.id, // Ensure ID doesn't change
      status: updates.status || sequence.status,
      metadata: new Map([...sequence.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated sequence
    this.validateSequence(updatedSequence);
    
    // Update in memory
    this.sequences.set(sequenceId, updatedSequence);
    
    // Update in database
    await this.db.taskSequences.update(sequenceId, {
      name: updatedSequence.name,
      description: updatedSequence.description,
      version: updatedSequence.version,
      project_id: updatedSequence.projectId,
      nodes: updatedSequence.nodes,
      transitions: updatedSequence.transitions,
      variables: updatedSequence.variables,
      timeout_seconds: updatedSequence.timeoutSeconds,
      status: updatedSequence.status,
      metadata: Object.fromEntries(updatedSequence.metadata)
    });
  }
  
  async activateSequence(sequenceId: string): Promise<void> {
    // Get sequence
    const sequence = await this.getSequence(sequenceId);
    
    // Check if sequence can be activated
    if (sequence.status !== SequenceStatus.DRAFT) {
      throw new Error(`Cannot activate sequence ${sequenceId} with status ${sequence.status}`);
    }
    
    // Validate sequence thoroughly
    this.validateSequenceForActivation(sequence);
    
    // Update status
    await this.updateSequence(sequenceId, { status: SequenceStatus.ACTIVE });
  }
  
  async executeSequence(sequenceId: string, initialVariables: Map<string, any> = new Map()): Promise<string> {
    // Get sequence
    const sequence = await this.getSequence(sequenceId);
    
    // Check if sequence can be executed
    if (sequence.status !== SequenceStatus.ACTIVE) {
      throw new Error(`Cannot execute sequence ${sequenceId} with status ${sequence.status}`);
    }
    
    // Find start node
    const startNode = sequence.nodes.find(node => node.type === TaskNodeType.START);
    if (!startNode) {
      throw new Error(`Sequence ${sequenceId} does not have a start node`);
    }
    
    // Initialize variables
    const variables = new Map<string, any>();
    
    // Set default values from sequence variables
    for (const variable of sequence.variables) {
      if (variable.defaultValue !== undefined) {
        variables.set(variable.name, variable.defaultValue);
      }
    }
    
    // Override with initial variables
    for (const [key, value] of initialVariables.entries()) {
      variables.set(key, value);
    }
    
    // Generate execution ID
    const executionId = uuidv4();
    
    // Create execution object
    const execution: SequenceExecution = {
      id: executionId,
      sequenceId,
      projectId: sequence.projectId,
      startTime: new Date(),
      status: ExecutionStatus.PENDING,
      currentNodeIds: [startNode.id],
      variables,
      nodeExecutions: new Map(),
      errors: [],
      metadata: new Map()
    };
    
    // Add to memory
    this.executions.set(executionId, execution);
    
    // Store in database
    await this.db.sequenceExecutions.create({
      uuid: executionId,
      sequence_id: execution.sequenceId,
      project_id: execution.projectId,
      start_time: execution.startTime,
      status: execution.status,
      current_node_ids: execution.currentNodeIds,
      variables: Object.fromEntries(execution.variables),
      node_executions: Object.fromEntries(Array.from(execution.nodeExecutions.entries()).map(
        ([nodeId, nodeExec]) => [nodeId, {
          status: nodeExec.status,
          start_time: nodeExec.startTime,
          end_time: nodeExec.endTime,
          attempts: nodeExec.attempts,
          inputs: Object.fromEntries(nodeExec.inputs),
          outputs: Object.fromEntries(nodeExec.outputs),
          error: nodeExec.error
        }]
      )),
      errors: execution.errors,
      metadata: Object.fromEntries(execution.metadata)
    });
    
    // Notify execution engine
    this.executionEngine.notifyNewExecution(executionId);
    
    return executionId;
  }
  
  async cancelExecution(executionId: string): Promise<void> {
    // Get execution
    const execution = await this.getExecution(executionId);
    
    // Check if execution can be cancelled
    if (execution.status !== ExecutionStatus.PENDING && 
        execution.status !== ExecutionStatus.RUNNING &&
        execution.status !== ExecutionStatus.WAITING) {
      throw new Error(`Cannot cancel execution ${executionId} with status ${execution.status}`);
    }
    
    // Update status
    execution.status = ExecutionStatus.CANCELLED;
    execution.endTime = new Date();
    
    // Update in memory
    this.executions.set(executionId, execution);
    
    // Update in database
    await this.db.sequenceExecutions.update(executionId, {
      status: execution.status,
      end_time: execution.endTime
    });
    
    // Notify execution engine
    this.executionEngine.notifyCancelledExecution(executionId);
  }
  
  async getSequence(sequenceId: string): Promise<TaskSequence> {
    // Check in memory
    if (this.sequences.has(sequenceId)) {
      return this.sequences.get(sequenceId);
    }
    
    // Get from database
    const sequenceData = await this.db.taskSequences.findByUuid(sequenceId);
    if (!sequenceData) {
      throw new Error(`Sequence ${sequenceId} not found`);
    }
    
    // Convert to TaskSequence object
    const sequence: TaskSequence = {
      id: sequenceData.uuid,
      name: sequenceData.name,
      description: sequenceData.description,
      version: sequenceData.version,
      projectId: sequenceData.project_id,
      nodes: sequenceData.nodes,
      transitions: sequenceData.transitions,
      variables: sequenceData.variables,
      timeoutSeconds: sequenceData.timeout_seconds,
      status: sequenceData.status as SequenceStatus,
      metadata: new Map(Object.entries(sequenceData.metadata || {}))
    };
    
    // Add to memory
    this.sequences.set(sequenceId, sequence);
    
    return sequence;
  }
  
  async getExecution(executionId: string): Promise<SequenceExecution> {
    // Check in memory
    if (this.executions.has(executionId)) {
      return this.executions.get(executionId);
    }
    
    // Get from database
    const executionData = await this.db.sequenceExecutions.findByUuid(executionId);
    if (!executionData) {
      throw new Error(`Execution ${executionId} not found`);
    }
    
    // Convert to SequenceExecution object
    const execution: SequenceExecution = {
      id: executionData.uuid,
      sequenceId: executionData.sequence_id,
      projectId: executionData.project_id,
      startTime: executionData.start_time,
      endTime: executionData.end_time,
      status: executionData.status as ExecutionStatus,
      currentNodeIds: executionData.current_node_ids,
      variables: new Map(Object.entries(executionData.variables || {})),
      nodeExecutions: new Map(Object.entries(executionData.node_executions || {}).map(
        ([nodeId, execData]) => [nodeId, {
          nodeId,
          status: execData.status,
          startTime: execData.start_time,
          endTime: execData.end_time,
          attempts: execData.attempts,
          inputs: new Map(Object.entries(execData.inputs || {})),
          outputs: new Map(Object.entries(execData.outputs || {})),
          error: execData.error
        }]
      )),
      errors: executionData.errors || [],
      metadata: new Map(Object.entries(executionData.metadata || {}))
    };
    
    // Add to memory
    this.executions.set(executionId, execution);
    
    return execution;
  }
  
  private validateSequence(sequence: TaskSequence): void {
    // Check required fields
    if (!sequence.name) {
      throw new Error('Sequence name is required');
    }
    
    if (!sequence.projectId) {
      throw new Error('Sequence project ID is required');
    }
    
    // Check nodes
    if (!sequence.nodes || sequence.nodes.length === 0) {
      throw new Error('Sequence must have at least one node');
    }
    
    // Check for start and end nodes
    const startNodes = sequence.nodes.filter(node => node.type === TaskNodeType.START);
    if (startNodes.length === 0) {
      throw new Error('Sequence must have a start node');
    }
    if (startNodes.length > 1) {
      throw new Error('Sequence must have exactly one start node');
    }
    
    const endNodes = sequence.nodes.filter(node => node.type === TaskNodeType.END);
    if (endNodes.length === 0) {
      throw new Error('Sequence must have at least one end node');
    }
    
    // Check node IDs are unique
    const nodeIds = new Set<string>();
    for (const node of sequence.nodes) {
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }
    
    // Check transitions
    if (!sequence.transitions || sequence.transitions.length === 0) {
      throw new Error('Sequence must have at least one transition');
    }
    
    // Check transition IDs are unique
    const transitionIds = new Set<string>();
    for (const transition of sequence.transitions) {
      if (transitionIds.has(transition.id)) {
        throw new Error(`Duplicate transition ID: ${transition.id}`);
      }
      transitionIds.add(transition.id);
    }
    
    // Check transition references valid nodes
    for (const transition of sequence.transitions) {
      if (!nodeIds.has(transition.sourceNodeId)) {
        throw new Error(`Transition ${transition.id} references non-existent source node: ${transition.sourceNodeId}`);
      }
      
      if (!nodeIds.has(transition.targetNodeId)) {
        throw new Error(`Transition ${transition.id} references non-existent target node: ${transition.targetNodeId}`);
      }
    }
    
    // Check variable names are unique
    const variableNames = new Set<string>();
    for (const variable of sequence.variables) {
      if (variableNames.has(variable.name)) {
        throw new Error(`Duplicate variable name: ${variable.name}`);
      }
      variableNames.add(variable.name);
    }
  }
  
  private validateSequenceForActivation(sequence: TaskSequence): void {
    // Perform basic validation
    this.validateSequence(sequence);
    
    // Check for unreachable nodes
    const reachableNodes = this.findReachableNodes(sequence);
    const unreachableNodes = sequence.nodes.filter(node => !reachableNodes.has(node.id));
    
    if (unreachableNodes.length > 0) {
      throw new Error(`Sequence has unreachable nodes: ${unreachableNodes.map(n => n.id).join(', ')}`);
    }
    
    // Check for nodes without outgoing transitions (except END nodes)
    const nodesWithoutOutgoing = sequence.nodes.filter(node => {
      if (node.type === TaskNodeType.END) {
        return false; // END nodes don't need outgoing transitions
      }
      
      const outgoingTransitions = sequence.transitions.filter(t => t.sourceNodeId === node.id);
      return outgoingTransitions.length === 0;
    });
    
    if (nodesWithoutOutgoing.length > 0) {
      throw new Error(`Nodes without outgoing transitions: ${nodesWithoutOutgoing.map(n => n.id).join(', ')}`);
    }
    
    // Check for decision nodes with missing conditions
    const decisionNodes = sequence.nodes.filter(node => node.type === TaskNodeType.DECISION);
    for (const node of decisionNodes) {
      const outgoingTransitions = sequence.transitions.filter(t => t.sourceNodeId === node.id);
      
      // Check if at least one transition has no condition (default path)
      const hasDefaultPath = outgoingTransitions.some(t => !t.condition);
      
      if (!hasDefaultPath) {
        throw new Error(`Decision node ${node.id} has no default path (transition without condition)`);
      }
    }
    
    // Check for circular dependencies
    const circularPaths = this.findCircularPaths(sequence);
    if (circularPaths.length > 0) {
      // Circular paths are allowed, but we should log them
      console.warn(`Sequence has circular paths: ${JSON.stringify(circularPaths)}`);
    }
  }
  
  private findReachableNodes(sequence: TaskSequence): Set<string> {
    // Find start node
    const startNode = sequence.nodes.find(node => node.type === TaskNodeType.START);
    if (!startNode) {
      return new Set();
    }
    
    // Perform breadth-first search from start node
    const reachableNodes = new Set<string>();
    const queue: string[] = [startNode.id];
    
    while (queue.length > 0) {
      const nodeId = queue.shift();
      
      // Skip if already visited
      if (reachableNodes.has(nodeId)) {
        continue;
      }
      
      // Mark as reachable
      reachableNodes.add(nodeId);
      
      // Add outgoing transitions to queue
      const outgoingTransitions = sequence.transitions.filter(t => t.sourceNodeId === nodeId);
      for (const transition of outgoingTransitions) {
        queue.push(transition.targetNodeId);
      }
    }
    
    return reachableNodes;
  }
  
  private findCircularPaths(sequence: TaskSequence): string[][] {
    const circularPaths: string[][] = [];
    const visited = new Set<string>();
    const path: string[] = [];
    
    // Find start node
    const startNode = sequence.nodes.find(node => node.type === TaskNodeType.START);
    if (!startNode) {
      return circularPaths;
    }
    
    // Perform depth-first search from start node
    this.dfsForCircularPaths(sequence, startNode.id, visited, path, circularPaths);
    
    return circularPaths;
  }
  
  private dfsForCircularPaths(
    sequence: TaskSequence,
    nodeId: string,
    visited: Set<string>,
    path: string[],
    circularPaths: string[][]
  ): void {
    // Check if node is already in current path (circular path)
    const nodeIndex = path.indexOf(nodeId);
    if (nodeIndex >= 0) {
      // Found circular path
      circularPaths.push(path.slice(nodeIndex).concat(nodeId));
      return;
    }
    
    // Check if node is already visited
    if (visited.has(nodeId)) {
      return;
    }
    
    // Mark as visited
    visited.add(nodeId);
    path.push(nodeId);
    
    // Visit outgoing transitions
    const outgoingTransitions = sequence.transitions.filter(t => t.sourceNodeId === nodeId);
    for (const transition of outgoingTransitions) {
      this.dfsForCircularPaths(sequence, transition.targetNodeId, visited, path, circularPaths);
    }
    
    // Remove from path
    path.pop();
  }
}

// Sequence Execution Engine
class SequenceExecutionEngine {
  private system: TaskSequenceManagementSystem;
  private running: boolean;
  private executionQueue: string[];
  private activeExecutions: Set<string>;
  private maxConcurrentExecutions: number;
  
  constructor(system: TaskSequenceManagementSystem) {
    this.system = system;
    this.running = false;
    this.executionQueue = [];
    this.activeExecutions = new Set();
    this.maxConcurrentExecutions = 10; // Configurable
  }
  
  start(): void {
    if (this.running) {
      return;
    }
    
    this.running = true;
    this.processExecutions();
  }
  
  stop(): void {
    this.running = false;
  }
  
  notifyNewExecution(executionId: string): void {
    this.executionQueue.push(executionId);
    this.processExecutions();
  }
  
  notifyCancelledExecution(executionId: string): void {
    // Remove from queue if present
    const index = this.executionQueue.indexOf(executionId);
    if (index >= 0) {
      this.executionQueue.splice(index, 1);
    }
    
    // Remove from active executions
    this.activeExecutions.delete(executionId);
  }
  
  private async processExecutions(): Promise<void> {
    if (!this.running) {
      return;
    }
    
    // Process executions until queue is empty or max concurrent reached
    while (this.executionQueue.length > 0 && this.activeExecutions.size < this.maxConcurrentExecutions) {
      const executionId = this.executionQueue.shift();
      
      // Add to active executions
      this.activeExecutions.add(executionId);
      
      // Process execution asynchronously
      this.processExecution(executionId).catch(error => {
        console.error(`Error processing execution ${executionId}:`, error);
      });
    }
    
    // Schedule next processing
    setTimeout(() => this.processExecutions(), 100);
  }
  
  private async processExecution(executionId: string): Promise<void> {
    try {
      // Get execution
      const execution = await this.system.getExecution(executionId);
      
      // Check if execution is still active
      if (execution.status !== ExecutionStatus.PENDING && 
          execution.status !== ExecutionStatus.RUNNING &&
          execution.status !== ExecutionStatus.WAITING) {
        // Remove from active executions
        this.activeExecutions.delete(executionId);
        return;
      }
      
      // Get sequence
      const sequence = await this.system.getSequence(execution.sequenceId);
      
      // Update status to running if pending
      if (execution.status === ExecutionStatus.PENDING) {
        execution.status = ExecutionStatus.RUNNING;
        await this.updateExecution(execution);
      }
      
      // Process current nodes
      const nodesToProcess = [...execution.currentNodeIds];
      execution.currentNodeIds = [];
      
      for (const nodeId of nodesToProcess) {
        await this.processNode(execution, sequence, nodeId);
      }
      
      // Check if execution is complete
      if (execution.currentNodeIds.length === 0) {
        // Check if any nodes are still running
        const runningNodes = Array.from(execution.nodeExecutions.values())
          .filter(ne => ne.status === ExecutionStatus.RUNNING || ne.status === ExecutionStatus.PENDING);
        
        if (runningNodes.length === 0) {
          // Check if any nodes failed
          const failedNodes = Array.from(execution.nodeExecutions.values())
            .filter(ne => ne.status === ExecutionStatus.FAILED);
          
          if (failedNodes.length > 0) {
            // Execution failed
            execution.status = ExecutionStatus.FAILED;
          } else {
            // Execution succeeded
            execution.status = ExecutionStatus.SUCCEEDED;
          }
          
          execution.endTime = new Date();
          await this.updateExecution(execution);
          
          // Remove from active executions
          this.activeExecutions.delete(executionId);
        }
      }
    } catch (error) {
      // Log error
      console.error(`Error processing execution ${executionId}:`, error);
      
      try {
        // Get execution
        const execution = await this.system.getExecution(executionId);
        
        // Update status to failed
        execution.status = ExecutionStatus.FAILED;
        execution.endTime = new Date();
        execution.errors.push({
          code: 'EXECUTION_ERROR',
          message: error.message,
          details: error.stack,
          timestamp: new Date(),
          retryable: false
        });
        
        await this.updateExecution(execution);
      } catch (updateError) {
