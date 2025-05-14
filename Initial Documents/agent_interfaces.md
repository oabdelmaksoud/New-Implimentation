# Agent Interfaces Design: Agentic System

## 1. Introduction

### 1.1 Purpose
This document defines the key interfaces for agents within the Agentic System. These interfaces specify how agents interact with each other, with core system services (like Task Management, Knowledge Management, Control Plane), and with the MCP (Model Context Protocol) infrastructure. Clear and well-defined interfaces are crucial for interoperability, modularity, and developer productivity.

### 1.2 Scope
This design covers:
- **Agent Lifecycle Interface:** Methods exposed by agents for management by the Agent Core Service and Agent Runtimes.
- **Agent Communication Interface (Events):** Standardized message formats for Kafka-based communication.
- **Agent Control Interface (gRPC):** Service definitions for direct commands and interactions via the Control Plane.
- **Agent Task Management Interface:** How agents receive, process, and update tasks.
- **Agent Knowledge Access Interface:** How agents query and contribute to the Knowledge Management System.
- **Agent MCP Tool Usage Interface:** How agents discover and invoke tools via MCP servers.

### 1.3 Design Principles
- **Standardization:** Use common patterns and data formats.
- **Clarity:** Interfaces should be easy to understand and use.
- **Abstraction:** Hide underlying implementation complexities.
- **Extensibility:** Allow for future additions and modifications without breaking existing integrations.
- **Strong Typing:** Utilize Protocol Buffers for gRPC and consider schema validation for Kafka messages to ensure data integrity.

### 1.4 References
- `Requirements/detailed_requirements.md`
- `Architecture/system_architecture.md`
- `Initial Documents/agent_framework.md`
- `Initial Documents/integration_layer.md`
- `Requirements/technical_stack.md`
- Protocol Buffer Language Guide
- Apache Kafka Documentation
- OpenAPI Specification (for any RESTful aspects of MCP or internal APIs if applicable)

## 2. Agent Lifecycle Interface (Implemented by BaseAgent SDK)

These are methods that the `BaseAgent` class (or SDK) will provide, which are called by the Agent Runtime or Agent Core Service at different points in an agent's lifecycle. Agent developers will typically override these to implement custom logic.

- **`async on_init(self, agent_id: str, config: Dict) -> None`:**
    - Called once when the agent instance is being initialized.
    - Purpose: Perform initial setup, load static configuration.
    - `agent_id`: Unique identifier for this agent instance.
    - `config`: Agent-specific configuration dictionary.
- **`async on_start(self) -> None`:**
    - Called when the agent is instructed to start its primary operations.
    - Purpose: Connect to Kafka, Redis, subscribe to initial topics, load initial state.
- **`async on_stop(self) -> None`:**
    - Called when the agent is instructed to shut down gracefully.
    - Purpose: Clean up resources, complete any in-flight work, unsubscribe from topics, disconnect from services.
- **`async on_pause(self) -> None` (Optional):**
    - Called if the system supports pausing agent activity without a full stop.
    - Purpose: Temporarily halt message processing or task execution.
- **`async on_resume(self) -> None` (Optional):**
    - Called to resume activity after being paused.
- **`async on_config_update(self, new_config: Dict) -> None` (Optional):**
    - Called if the agent supports dynamic configuration updates without a restart.
    - `new_config`: The updated configuration dictionary.
- **`async health_check(self) -> Dict`:**
    - Called periodically by the Agent Runtime or Agent Core Service.
    - Purpose: Report the agent's health status.
    - Returns: A dictionary with health status (e.g., `{"status": "HEALTHY", "details": "..."}`).

## 3. Agent Communication Interface (Events via Kafka)

Standardized message formats (schemas) for events published to and consumed from Kafka. JSON is a common choice for simplicity, but Avro with a Schema Registry is recommended for strong typing and schema evolution in production.

### 3.1 Common Event Envelope
All Kafka messages should share a common envelope:
```json
{
  "eventId": "uuid",          // Unique ID for this event
  "eventType": "string",      // e.g., "task.assigned", "knowledge.updated.entity"
  "sourceAgentId": "string",  // ID of the agent/service publishing the event (optional)
  "timestamp": "iso8601_datetime_utc",
  "version": "string",        // Schema version, e.g., "1.0"
  "correlationId": "uuid",    // To track related events across a workflow (optional)
  "payload": { /* Event-specific data */ }
}
```

### 3.2 Example Event Types and Payloads

- **`task.assigned`**
  ```json
  // payload:
  {
    "taskId": "uuid",
    "taskDefinition": { /* ... details of the task ... */ },
    "assignedToAgentId": "string",
    "priority": "integer"
  }
  ```
- **`task.status.updated`**
  ```json
  // payload:
  {
    "taskId": "uuid",
    "status": "string", // e.g., "IN_PROGRESS", "COMPLETED", "FAILED"
    "progressPercentage": "integer", // 0-100
    "message": "string", // Optional status message or error details
    "updatedByAgentId": "string"
  }
  ```
- **`agent.capability.discovered`**
  ```json
  // payload:
  {
    "agentId": "string",
    "capabilityName": "string",
    "capabilitySchema": { /* Input/output schema for the capability */ }
  }
  ```
- **`knowledge.entity.created` / `knowledge.entity.updated`**
  ```json
  // payload:
  {
    "entityId": "string",
    "entityType": "string",
    "entityData": { /* ... data of the entity ... */ },
    "source": "string" // Where the knowledge originated
  }
  ```

## 4. Agent Control Interface (gRPC via Control Plane)

Service definitions using Protocol Buffers for direct, synchronous commands or requests between the Control Plane (or other core services) and Agent Runtimes/Agents.

**File: `agent_control.proto`**
```protobuf
syntax = "proto3";

package agentic_system.control;

// Common Structures
message AgentIdentifier {
  string agent_id = 1;
}

message TaskInfo {
  string task_id = 1;
  string task_type = 2;
  bytes task_payload = 3; // Serialized task-specific data
  map<string, string> metadata = 4;
}

message CommandResponse {
  bool success = 1;
  string message = 2; // Optional message or error details
}

// Service for Agent Lifecycle and Task Management
service AgentControlService {
  // Instructs an agent to start processing a specific task
  rpc AssignTask(AssignTaskRequest) returns (CommandResponse);

  // Queries the status of a task being processed by an agent
  rpc GetTaskStatus(GetTaskStatusRequest) returns (TaskStatusResponse);

  // Instructs an agent to pause its operations
  rpc PauseAgent(AgentIdentifier) returns (CommandResponse);

  // Instructs an agent to resume its operations
  rpc ResumeAgent(AgentIdentifier) returns (CommandResponse);

  // Instructs an agent to update its configuration
  rpc UpdateAgentConfiguration(UpdateAgentConfigurationRequest) returns (CommandResponse);

  // Requests an agent to report its current health
  rpc GetAgentHealth(AgentIdentifier) returns (AgentHealthResponse);
}

message AssignTaskRequest {
  AgentIdentifier agent_identifier = 1;
  TaskInfo task_info = 2;
}

message GetTaskStatusRequest {
  AgentIdentifier agent_identifier = 1;
  string task_id = 2;
}

message TaskStatusResponse {
  string task_id = 1;
  enum Status {
    UNKNOWN = 0;
    PENDING = 1;
    IN_PROGRESS = 2;
    COMPLETED = 3;
    FAILED = 4;
    PAUSED = 5;
  }
  Status status = 2;
  int32 progress_percentage = 3;
  string message = 4;
}

message UpdateAgentConfigurationRequest {
  AgentIdentifier agent_identifier = 1;
  map<string, string> new_config_json = 2; // Configuration as a JSON string map
}

message AgentHealthResponse {
  string agent_id = 1;
  enum HealthStatus {
    HEALTH_UNKNOWN = 0;
    HEALTHY = 1;
    UNHEALTHY = 2;
    DEGRADED = 3;
  }
  HealthStatus status = 2;
  string details = 3; // Optional details
}
```

## 5. Agent Task Management Interface

- **Receiving Tasks:**
    - Primarily via Kafka: Agents subscribe to `task.assigned` (or similar) topics relevant to their capabilities.
    - Alternatively, the Control Plane might directly assign a task via the `AssignTask` gRPC call to a specific Agent Runtime, which then forwards it to the agent.
- **Processing Tasks:**
    - Agent uses its internal logic, skills, and MCP tools.
- **Updating Task Status:**
    - Agent publishes `task.status.updated` events to Kafka.
    - The Task Management Service consumes these events to update its persistent store.
    - For critical or immediate updates, an agent might also call a gRPC endpoint on the Task Management Service (if provided).

## 6. Agent Knowledge Access Interface

- **Querying Knowledge:**
    - Agents use a client library (part of BaseAgent SDK) to make gRPC or HTTP requests to the Knowledge Management Service's API.
    - Interface:
        - `SearchKnowledge(query: string, filters: map<string, string>, limit: int) -> list<KnowledgeResult>`
        - `GetEntityById(entity_id: string) -> EntityData`
- **Contributing Knowledge:**
    - Agents publish `knowledge.entity.created` or `knowledge.entity.updated` events to Kafka.
    - The Knowledge Management Service consumes these events to ingest new knowledge.
    - Alternatively, a direct API endpoint on the Knowledge Management Service could be used for submissions.
    - Interface:
        - `ContributeKnowledge(entity_data: EntityData, source: string) -> ContributionResponse`

## 7. Agent MCP Tool Usage Interface (via MCP Client Library)

The MCP Client Library (part of BaseAgent SDK) provides a programmatic interface for agents to use tools.

- **`async mcp.discover_tools(capability_filter: Optional[str] = None, server_filter: Optional[str] = None) -> List[ToolSchema]`:**
    - Queries the MCP Server Registry.
    - Returns a list of available tool schemas matching optional filters.
- **`async mcp.tools.<server_name>.<tool_name>(**kwargs) -> ToolResult`:**
    - Dynamically provides access to discovered tools.
    - Example: `await self.mcp.tools.github_mcp.create_issue(repo="org/repo", title="New Bug")`
    - `kwargs`: Arguments for the tool, validated against its schema.
    - `ToolResult`: Contains the output from the tool, or error information.
- **ToolSchema (Conceptual):**
  ```json
  {
    "serverName": "string",
    "toolName": "string",
    "description": "string",
    "inputSchema": { /* JSON Schema for input parameters */ },
    "outputSchema": { /* JSON Schema for output */ }
  }
  ```

## 8. Interface Versioning

- **gRPC APIs:** Use Protocol Buffer package versioning (e.g., `v1`, `v2` in package names) or service name versioning. Maintain backward compatibility where possible.
- **Kafka Events:** Include a `version` field in the event envelope. Consumers should be designed to handle older versions or specific versions they understand. Schema Registry helps manage schema evolution.
- **REST APIs (if any, e.g., for MCP):** Use URL path versioning (e.g., `/api/v1/...`) or header-based versioning.

These interfaces provide the contracts for interaction within the Agentic System. They will be implemented by the respective components (BaseAgent SDK, Core Services, Agent Runtimes) and are subject to refinement as development progresses.
