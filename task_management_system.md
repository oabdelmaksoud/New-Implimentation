# Task Management System

## Overview

The Task Management System is a core component of the Agent Capabilities and Communication phase. It provides comprehensive functionality for defining, assigning, tracking, and executing tasks within the agent system. This document outlines the detailed implementation plan for the Task Management System.

## Objectives

- Implement comprehensive task management
- Create task assignment and tracking
- Develop task dependencies and workflows

## Tasks

1. **Task Definition and Creation**
   - Implement task data models
   - Create task creation APIs
   - Develop task validation
   - Implement task templates

2. **Task Assignment and Scheduling**
   - Create assignment algorithms based on agent capabilities
   - Implement task prioritization
   - Develop scheduling mechanisms
   - Create load balancing for task distribution

3. **Task Execution and Monitoring**
   - Implement task execution tracking
   - Create progress reporting
   - Develop execution metrics
   - Implement execution logging

4. **Task Dependencies and Workflows**
   - Create task dependency graphs
   - Implement workflow definitions
   - Develop conditional execution paths
   - Create workflow templates

## Micro-Level Implementation Details

### Task Structure

```typescript
// Task Structure
interface Task {
  id: string;                     // Unique task ID
  title: string;                  // Human-readable title
  description: string;            // Detailed description
  status: TaskStatus;             // Current status
  priority: TaskPriority;         // Priority level
  createdAt: Date;                // Creation timestamp
  deadline?: Date;                // Optional deadline
  assignedTo?: AgentReference;    // Assigned agent
  createdBy: AgentReference;      // Creator
  dependencies: TaskDependency[]; // Dependencies on other tasks
  subtasks: Task[];               // Hierarchical subtasks
  artifacts: Artifact[];          // Task inputs/outputs
  metadata: Map<string, any>;     // Additional metadata
}

// Task Status Enum
enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Task Priority Enum
enum TaskPriority {
  LOWEST = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  HIGHEST = 4,
  CRITICAL = 5
}

// Task Dependency Types
interface TaskDependency {
  taskId: string;                 // Referenced task
  type: DependencyType;           // Type of dependency
  condition?: DependencyCondition; // Optional condition
}

enum DependencyType {
  FINISH_TO_START,    // Referenced task must finish before this task starts
  START_TO_START,     // Referenced task must start before this task starts
  FINISH_TO_FINISH,   // Referenced task must finish before this task finishes
  START_TO_FINISH     // Referenced task must start before this task finishes
}

// Dependency Condition
interface DependencyCondition {
  type: ConditionType;
  parameters: any;
}

enum ConditionType {
  STATUS_EQUALS,
  STATUS_NOT_EQUALS,
  ARTIFACT_EXISTS,
  ARTIFACT_MATCHES,
  CUSTOM_CONDITION
}

// Task Artifact
interface Artifact {
  id: string;
  name: string;
  type: string;
  contentType: string;
  size: number;
  url?: string;
  content?: any;
  metadata: Map<string, any>;
  createdAt: Date;
}
```

### Task Manager Implementation

```typescript
// Task Manager
class TaskManager {
  private tasks: Map<string, Task>;
  private tasksByProject: Map<string, Set<string>>;
  private tasksByAgent: Map<string, Set<string>>;
  private taskDependencyGraph: DirectedAcyclicGraph;
  private taskScheduler: TaskScheduler;
  private db: Database;
  
  constructor(db: Database) {
    this.tasks = new Map();
    this.tasksByProject = new Map();
    this.tasksByAgent = new Map();
    this.taskDependencyGraph = new DirectedAcyclicGraph();
    this.taskScheduler = new TaskScheduler();
    this.db = db;
  }
  
  async createTask(taskData: CreateTaskRequest): Promise<string> {
    // Validate task data
    this.validateTaskData(taskData);
    
    // Generate task ID
    const taskId = uuidv4();
    
    // Create task object
    const task: Task = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      status: TaskStatus.PENDING,
      priority: taskData.priority || TaskPriority.MEDIUM,
      createdAt: new Date(),
      createdBy: taskData.createdBy,
      dependencies: taskData.dependencies || [],
      subtasks: [],
      artifacts: [],
      metadata: new Map(Object.entries(taskData.metadata || {}))
    };
    
    // Set optional fields
    if (taskData.deadline) {
      task.deadline = new Date(taskData.deadline);
    }
    if (taskData.assignedTo) {
      task.assignedTo = taskData.assignedTo;
      task.status = TaskStatus.ASSIGNED;
    }
    
    // Store task in memory
    this.tasks.set(taskId, task);
    
    // Update project index
    const projectId = taskData.projectId;
    if (!this.tasksByProject.has(projectId)) {
      this.tasksByProject.set(projectId, new Set());
    }
    this.tasksByProject.get(projectId).add(taskId);
    
    // Update agent index if assigned
    if (task.assignedTo) {
      const agentId = task.assignedTo.id;
      if (!this.tasksByAgent.has(agentId)) {
        this.tasksByAgent.set(agentId, new Set());
      }
      this.tasksByAgent.get(agentId).add(taskId);
    }
    
    // Update dependency graph
    for (const dependency of task.dependencies) {
      this.taskDependencyGraph.addEdge(dependency.taskId, taskId, {
        type: dependency.type,
        condition: dependency.condition
      });
    }
    
    // Store in database
    await this.db.tasks.create({
      uuid: taskId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      project_id: projectId,
      assigned_to: task.assignedTo ? task.assignedTo.id : null,
      created_by: task.createdBy.id,
      deadline: task.deadline,
      metadata: Object.fromEntries(task.metadata)
    });
    
    // Store dependencies in database
    for (const dependency of task.dependencies) {
      await this.db.taskDependencies.create({
        source_task_id: dependency.taskId,
        target_task_id: taskId,
        dependency_type: dependency.type
      });
    }
    
    // Schedule task if appropriate
    if (task.status === TaskStatus.ASSIGNED) {
      await this.taskScheduler.scheduleTask(task);
    }
    
    return taskId;
  }
  
  async getTask(taskId: string): Promise<Task> {
    // Check in memory
    if (this.tasks.has(taskId)) {
      return this.tasks.get(taskId);
    }
    
    // Get from database
    const taskData = await this.db.tasks.findByUuid(taskId);
    if (!taskData) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // Convert to Task object
    const task: Task = {
      id: taskData.uuid,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status as TaskStatus,
      priority: taskData.priority as TaskPriority,
      createdAt: taskData.created_at,
      createdBy: { id: taskData.created_by, name: '' }, // Name will be populated later
      dependencies: [],
      subtasks: [],
      artifacts: [],
      metadata: new Map(Object.entries(taskData.metadata || {}))
    };
    
    // Set optional fields
    if (taskData.deadline) {
      task.deadline = taskData.deadline;
    }
    if (taskData.assigned_to) {
      task.assignedTo = { id: taskData.assigned_to, name: '' }; // Name will be populated later
    }
    
    // Get dependencies
    const dependencies = await this.db.taskDependencies.findByTargetTaskId(taskId);
    task.dependencies = dependencies.map(dep => ({
      taskId: dep.source_task_id,
      type: dep.dependency_type as DependencyType
    }));
    
    // Get subtasks
    const subtasks = await this.db.tasks.findByParentTaskId(taskId);
    task.subtasks = await Promise.all(subtasks.map(subtask => this.getTask(subtask.uuid)));
    
    // Get artifacts
    const artifacts = await this.db.artifacts.findByTaskId(taskId);
    task.artifacts = artifacts.map(art => ({
      id: art.uuid,
      name: art.name,
      type: art.type,
      contentType: art.content_type,
      size: art.size,
      url: art.url,
      metadata: new Map(Object.entries(art.metadata || {})),
      createdAt: art.created_at
    }));
    
    // Cache in memory
    this.tasks.set(taskId, task);
    
    return task;
  }
  
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    // Get current task
    const task = await this.getTask(taskId);
    
    // Apply updates
    const updatedTask = {
      ...task,
      ...updates,
      id: task.id, // Ensure ID doesn't change
      createdAt: task.createdAt, // Ensure creation timestamp doesn't change
      createdBy: task.createdBy, // Ensure creator doesn't change
      metadata: new Map([...task.metadata, ...(updates.metadata || new Map())])
    };
    
    // Check if assignment changed
    const assignmentChanged = 
      (task.assignedTo?.id !== updatedTask.assignedTo?.id) ||
      (task.status !== updatedTask.status);
    
    // Update in memory
    this.tasks.set(taskId, updatedTask);
    
    // Update agent index if assignment changed
    if (assignmentChanged) {
      // Remove from old agent's tasks
      if (task.assignedTo) {
        const oldAgentId = task.assignedTo.id;
        if (this.tasksByAgent.has(oldAgentId)) {
          this.tasksByAgent.get(oldAgentId).delete(taskId);
        }
      }
      
      // Add to new agent's tasks
      if (updatedTask.assignedTo) {
        const newAgentId = updatedTask.assignedTo.id;
        if (!this.tasksByAgent.has(newAgentId)) {
          this.tasksByAgent.set(newAgentId, new Set());
        }
        this.tasksByAgent.get(newAgentId).add(taskId);
      }
    }
    
    // Update dependency graph if dependencies changed
    if (updates.dependencies) {
      // Remove old dependencies
      this.taskDependencyGraph.removeEdgesFrom(taskId);
      this.taskDependencyGraph.removeEdgesTo(taskId);
      
      // Add new dependencies
      for (const dependency of updatedTask.dependencies) {
        this.taskDependencyGraph.addEdge(dependency.taskId, taskId, {
          type: dependency.type,
          condition: dependency.condition
        });
      }
      
      // Update dependencies in database
      await this.db.taskDependencies.deleteByTargetTaskId(taskId);
      for (const dependency of updatedTask.dependencies) {
        await this.db.taskDependencies.create({
          source_task_id: dependency.taskId,
          target_task_id: taskId,
          dependency_type: dependency.type
        });
      }
    }
    
    // Update in database
    await this.db.tasks.update(taskId, {
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assigned_to: updatedTask.assignedTo ? updatedTask.assignedTo.id : null,
      deadline: updatedTask.deadline,
      metadata: Object.fromEntries(updatedTask.metadata)
    });
    
    // Reschedule if status or assignment changed
    if (assignmentChanged) {
      if (updatedTask.status === TaskStatus.ASSIGNED) {
        await this.taskScheduler.scheduleTask(updatedTask);
      } else {
        await this.taskScheduler.unscheduleTask(taskId);
      }
    }
  }
  
  async deleteTask(taskId: string): Promise<void> {
    // Get task
    const task = await this.getTask(taskId);
    
    // Check if task has dependents
    const dependents = this.taskDependencyGraph.getSuccessors(taskId);
    if (dependents.length > 0) {
      throw new Error(`Cannot delete task ${taskId} because it has dependent tasks: ${dependents.join(', ')}`);
    }
    
    // Remove from memory
    this.tasks.delete(taskId);
    
    // Remove from project index
    const projectId = await this.getTaskProjectId(taskId);
    if (this.tasksByProject.has(projectId)) {
      this.tasksByProject.get(projectId).delete(taskId);
    }
    
    // Remove from agent index
    if (task.assignedTo) {
      const agentId = task.assignedTo.id;
      if (this.tasksByAgent.has(agentId)) {
        this.tasksByAgent.get(agentId).delete(taskId);
      }
    }
    
    // Remove from dependency graph
    this.taskDependencyGraph.removeNode(taskId);
    
    // Remove from scheduler
    await this.taskScheduler.unscheduleTask(taskId);
    
    // Delete from database
    await this.db.taskDependencies.deleteBySourceTaskId(taskId);
    await this.db.taskDependencies.deleteByTargetTaskId(taskId);
    await this.db.artifacts.deleteByTaskId(taskId);
    await this.db.tasks.delete(taskId);
  }
  
  async assignTask(taskId: string, agentId: string): Promise<void> {
    // Get agent details
    const agent = await this.db.agents.findByUuid(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Update task
    await this.updateTask(taskId, {
      assignedTo: { id: agentId, name: agent.name },
      status: TaskStatus.ASSIGNED
    });
  }
  
  async startTask(taskId: string): Promise<void> {
    // Check if task is assigned
    const task = await this.getTask(taskId);
    if (task.status !== TaskStatus.ASSIGNED) {
      throw new Error(`Task ${taskId} is not assigned`);
    }
    
    // Check if dependencies are satisfied
    const canStart = await this.canTaskStart(taskId);
    if (!canStart) {
      throw new Error(`Task ${taskId} cannot start because its dependencies are not satisfied`);
    }
    
    // Update task status
    await this.updateTask(taskId, {
      status: TaskStatus.IN_PROGRESS
    });
  }
  
  async completeTask(taskId: string): Promise<void> {
    // Check if task is in progress
    const task = await this.getTask(taskId);
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new Error(`Task ${taskId} is not in progress`);
    }
    
    // Update task status
    await this.updateTask(taskId, {
      status: TaskStatus.COMPLETED,
      metadata: new Map([...task.metadata, ['completedAt', new Date().toISOString()]])
    });
    
    // Check if any dependent tasks can now start
    const dependents = this.taskDependencyGraph.getSuccessors(taskId);
    for (const dependentId of dependents) {
      const canStart = await this.canTaskStart(dependentId);
      if (canStart) {
        const dependentTask = await this.getTask(dependentId);
        if (dependentTask.status === TaskStatus.BLOCKED) {
          await this.updateTask(dependentId, {
            status: TaskStatus.ASSIGNED
          });
        }
      }
    }
  }
  
  async failTask(taskId: string, reason: string): Promise<void> {
    // Update task status
    const task = await this.getTask(taskId);
    await this.updateTask(taskId, {
      status: TaskStatus.FAILED,
      metadata: new Map([
        ...task.metadata,
        ['failedAt', new Date().toISOString()],
        ['failureReason', reason]
      ])
    });
    
    // Block dependent tasks
    const dependents = this.taskDependencyGraph.getSuccessors(taskId);
    for (const dependentId of dependents) {
      const dependentTask = await this.getTask(dependentId);
      if (dependentTask.status === TaskStatus.PENDING || dependentTask.status === TaskStatus.ASSIGNED) {
        await this.updateTask(dependentId, {
          status: TaskStatus.BLOCKED,
          metadata: new Map([
            ...dependentTask.metadata,
            ['blockedBy', taskId],
            ['blockedAt', new Date().toISOString()],
            ['blockReason', `Dependency ${taskId} failed: ${reason}`]
          ])
        });
      }
    }
  }
  
  async getTasksForProject(projectId: string): Promise<Task[]> {
    // Get task IDs for project
    let taskIds: string[];
    if (this.tasksByProject.has(projectId)) {
      taskIds = Array.from(this.tasksByProject.get(projectId));
    } else {
      // Get from database
      const taskData = await this.db.tasks.findByProjectId(projectId);
      taskIds = taskData.map(t => t.uuid);
      
      // Update project index
      this.tasksByProject.set(projectId, new Set(taskIds));
    }
    
    // Get tasks
    return Promise.all(taskIds.map(id => this.getTask(id)));
  }
  
  async getTasksForAgent(agentId: string): Promise<Task[]> {
    // Get task IDs for agent
    let taskIds: string[];
    if (this.tasksByAgent.has(agentId)) {
      taskIds = Array.from(this.tasksByAgent.get(agentId));
    } else {
      // Get from database
      const taskData = await this.db.tasks.findByAssignedTo(agentId);
      taskIds = taskData.map(t => t.uuid);
      
      // Update agent index
      this.tasksByAgent.set(agentId, new Set(taskIds));
    }
    
    // Get tasks
    return Promise.all(taskIds.map(id => this.getTask(id)));
  }
  
  async addArtifact(taskId: string, artifact: Omit<Artifact, 'id' | 'createdAt'>): Promise<string> {
    // Generate artifact ID
    const artifactId = uuidv4();
    
    // Create artifact object
    const newArtifact: Artifact = {
      ...artifact,
      id: artifactId,
      createdAt: new Date()
    };
    
    // Get task
    const task = await this.getTask(taskId);
    
    // Add artifact to task
    task.artifacts.push(newArtifact);
    
    // Update task in memory
    this.tasks.set(taskId, task);
    
    // Store in database
    await this.db.artifacts.create({
      uuid: artifactId,
      task_id: taskId,
      name: newArtifact.name,
      type: newArtifact.type,
      content_type: newArtifact.contentType,
      size: newArtifact.size,
      url: newArtifact.url,
      content: newArtifact.content,
      metadata: Object.fromEntries(newArtifact.metadata),
      created_at: newArtifact.createdAt
    });
    
    return artifactId;
  }
  
  private async canTaskStart(taskId: string): Promise<boolean> {
    // Get task dependencies
    const task = await this.getTask(taskId);
    
    // Check each dependency
    for (const dependency of task.dependencies) {
      const dependencyTask = await this.getTask(dependency.taskId);
      
      // Check dependency type
      switch (dependency.type) {
        case DependencyType.FINISH_TO_START:
          if (dependencyTask.status !== TaskStatus.COMPLETED) {
            return false;
          }
          break;
        case DependencyType.START_TO_START:
          if (dependencyTask.status !== TaskStatus.IN_PROGRESS && 
              dependencyTask.status !== TaskStatus.COMPLETED) {
            return false;
          }
          break;
        case DependencyType.FINISH_TO_FINISH:
          // This doesn't affect whether a task can start
          break;
        case DependencyType.START_TO_FINISH:
          // This doesn't affect whether a task can start
          break;
      }
      
      // Check condition if present
      if (dependency.condition) {
        const conditionMet = await this.evaluateDependencyCondition(
          dependency.condition,
          dependencyTask
        );
        if (!conditionMet) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  private async evaluateDependencyCondition(
    condition: DependencyCondition,
    dependencyTask: Task
  ): Promise<boolean> {
    switch (condition.type) {
      case ConditionType.STATUS_EQUALS:
        return dependencyTask.status === condition.parameters.status;
      case ConditionType.STATUS_NOT_EQUALS:
        return dependencyTask.status !== condition.parameters.status;
      case ConditionType.ARTIFACT_EXISTS:
        return dependencyTask.artifacts.some(a => a.name === condition.parameters.artifactName);
      case ConditionType.ARTIFACT_MATCHES:
        const artifact = dependencyTask.artifacts.find(a => a.name === condition.parameters.artifactName);
        if (!artifact) {
          return false;
        }
        // Check if artifact matches the condition
        // This would depend on the specific condition parameters
        return true; // Placeholder
      case ConditionType.CUSTOM_CONDITION:
        // Evaluate custom condition
        // This would depend on the specific condition parameters
        return true; // Placeholder
      default:
        return false;
    }
  }
  
  private async getTaskProjectId(taskId: string): Promise<string> {
    // Check in memory
    for (const [projectId, taskIds] of this.tasksByProject.entries()) {
      if (taskIds.has(taskId)) {
        return projectId;
      }
    }
    
    // Get from database
    const taskData = await this.db.tasks.findByUuid(taskId);
    return taskData.project_id;
  }
  
  private validateTaskData(taskData: CreateTaskRequest): void {
    // Validate required fields
    if (!taskData.title) {
      throw new Error('Task title is required');
    }
    if (!taskData.projectId) {
      throw new Error('Project ID is required');
    }
    if (!taskData.createdBy) {
      throw new Error('Creator is required');
    }
    
    // Validate dependencies
    if (taskData.dependencies) {
      for (const dependency of taskData.dependencies) {
        if (!dependency.taskId) {
          throw new Error('Dependency task ID is required');
        }
        if (dependency.taskId === taskData.id) {
          throw new Error('Task cannot depend on itself');
        }
      }
    }
    
    // Validate deadline
    if (taskData.deadline) {
      const deadline = new Date(taskData.deadline);
      if (isNaN(deadline.getTime())) {
        throw new Error('Invalid deadline date');
      }
      if (deadline < new Date()) {
        throw new Error('Deadline cannot be in the past');
      }
    }
  }
}
```

### Task Scheduler Implementation

```typescript
// Task Scheduler
class TaskScheduler {
  private scheduledTasks: Map<string, ScheduledTask>;
  private taskQueue: PriorityQueue<string>;
  private agentWorkloads: Map<string, number>;
  private maxAgentWorkload: number;
  
  constructor(maxAgentWorkload: number = 5) {
    this.scheduledTasks = new Map();
    this.taskQueue = new PriorityQueue<string>((a, b) => {
      const taskA = this.scheduledTasks.get(a);
      const taskB = this.scheduledTasks.get(b);
      
      // Compare priority (higher priority first)
      if (taskA.priority !== taskB.priority) {
        return taskB.priority - taskA.priority;
      }
      
      // If same priority, compare deadline (earlier deadline first)
      if (taskA.deadline && taskB.deadline) {
        return taskA.deadline.getTime() - taskB.deadline.getTime();
      }
      
      // If one has deadline and the other doesn't, the one with deadline comes first
      if (taskA.deadline) return -1;
      if (taskB.deadline) return 1;
      
      // If neither has deadline, compare creation time (older first)
      return taskA.createdAt.getTime() - taskB.createdAt.getTime();
    });
    this.agentWorkloads = new Map();
    this.maxAgentWorkload = maxAgentWorkload;
  }
  
  async scheduleTask(task: Task): Promise<void> {
    // Check if task is already scheduled
    if (this.scheduledTasks.has(task.id)) {
      // Update scheduled task
      const scheduledTask = this.scheduledTasks.get(task.id);
      scheduledTask.priority = task.priority;
      scheduledTask.deadline = task.deadline;
      scheduledTask.assignedTo = task.assignedTo?.id;
      
      // Reorder queue
      this.taskQueue.update(task.id);
      
      return;
    }
    
    // Create scheduled task
    const scheduledTask: ScheduledTask = {
      id: task.id,
      priority: task.priority,
      deadline: task.deadline,
      assignedTo: task.assignedTo?.id,
      createdAt: task.createdAt,
      scheduledAt: new Date()
    };
    
    // Add to scheduled tasks
    this.scheduledTasks.set(task.id, scheduledTask);
    
    // Add to queue
    this.taskQueue.enqueue(task.id);
    
    // Update agent workload
    if (task.assignedTo) {
      const agentId = task.assignedTo.id;
      const currentWorkload = this.agentWorkloads.get(agentId) || 0;
      this.agentWorkloads.set(agentId, currentWorkload + 1);
    }
  }
  
  async unscheduleTask(taskId: string): Promise<void> {
    // Check if task is scheduled
    if (!this.scheduledTasks.has(taskId)) {
      return;
    }
    
    // Get scheduled task
    const scheduledTask = this.scheduledTasks.get(taskId);
    
    // Remove from scheduled tasks
    this.scheduledTasks.delete(taskId);
    
    // Remove from queue
    this.taskQueue.remove(taskId);
    
    // Update agent workload
    if (scheduledTask.assignedTo) {
      const agentId = scheduledTask.assignedTo;
      const currentWorkload = this.agentWorkloads.get(agentId) || 0;
      if (currentWorkload > 0) {
        this.agentWorkloads.set(agentId, currentWorkload - 1);
      }
    }
  }
  
  async getNextTask(): Promise<string | null> {
    // Check if queue is empty
    if (this.taskQueue.isEmpty()) {
      return null;
    }
    
    // Get next task
    const taskId = this.taskQueue.peek();
    const scheduledTask = this.scheduledTasks.get(taskId);
    
    // Check if agent is overloaded
    if (scheduledTask.assignedTo) {
      const agentId = scheduledTask.assignedTo;
      const currentWorkload = this.agentWorkloads.get(agentId) || 0;
      if (currentWorkload >= this.maxAgentWorkload) {
        // Agent is overloaded, skip this task
        return null;
      }
    }
    
    return taskId;
  }
  
  async getAgentWorkload(agentId: string): Promise<number> {
    return this.agentWorkloads.get(agentId) || 0;
  }
  
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    return Array.from(this.scheduledTasks.values());
  }
}

// Scheduled Task
interface ScheduledTask {
  id: string;
  priority: TaskPriority;
  deadline?: Date;
  assignedTo?: string;
  createdAt: Date;
  scheduledAt: Date;
}
```

### Task Dependency Graph Implementation

```typescript
// Directed Acyclic Graph for Task Dependencies
class DirectedAcyclicGraph {
  private nodes: Set<string>;
  private edges: Map<string, Map<string, any>>;
  private incomingEdges: Map<string, Set<string>>;
  
  constructor() {
    this.nodes = new Set();
    this.edges = new Map();
    this.incomingEdges = new Map();
  }
  
  addNode(nodeId: string): void {
    this.nodes.add(nodeId);
    if (!this.edges.has(nodeId)) {
      this.edges.set(nodeId, new Map());
    }
    if (!this.incomingEdges.has(nodeId)) {
      this.incomingEdges.set(nodeId, new Set());
    }
  }
  
  removeNode(nodeId: string): void {
    // Remove outgoing edges
    if (this.edges.has(nodeId)) {
      const targets = Array.from(this.edges.get(nodeId).keys());
      for (const target of targets) {
        this.removeEdge(nodeId, target);
      }
      this.edges.delete(nodeId);
    }
    
    // Remove incoming edges
    if (this.incomingEdges.has(nodeId)) {
      const sources = Array.from(this.incomingEdges.get(nodeId));
      for (const source of sources) {
        this.removeEdge(source, nodeId);
      }
      this.incomingEdges.delete(nodeId);
    }
    
    // Remove node
    this.nodes.delete(nodeI
