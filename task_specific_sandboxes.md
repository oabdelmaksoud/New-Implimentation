# Task-Specific Sandboxes

## Overview

The Task-Specific Sandboxes component is a critical part of the Project-Specific Features phase. It enables the system to create isolated execution environments for specific tasks, ensuring security, resource control, and appropriate tooling for each task type. This document outlines the detailed implementation plan for the Task-Specific Sandboxes system.

## Objectives

- Implement secure task execution environments
- Create task-specific resource allocation
- Develop tool and dependency management
- Implement environment isolation and cleanup

## Tasks

1. **Sandbox Creation**
   - Implement sandbox templates
   - Create dynamic provisioning
   - Develop configuration management
   - Implement lifecycle management

2. **Resource Management**
   - Create resource allocation
   - Implement resource monitoring
   - Develop resource limits
   - Create resource optimization

3. **Tool Management**
   - Implement tool registry
   - Create tool installation
   - Develop tool versioning
   - Implement tool access control

4. **Security Controls**
   - Create network isolation
   - Implement file system isolation
   - Develop permission management
   - Implement security monitoring

## Micro-Level Implementation Details

### Sandbox Structure

```typescript
// Sandbox Template
interface SandboxTemplate {
  id: string;                     // Unique template ID
  name: string;                   // Template name
  description: string;            // Template description
  baseImage: string;              // Base container image
  resourceProfile: ResourceProfile; // Resource profile
  tools: ToolRequirement[];       // Required tools
  networkPolicy: NetworkPolicy;   // Network policy
  securityProfile: SecurityProfile; // Security profile
  environmentVariables: EnvironmentVariable[]; // Environment variables
  mountPoints: MountPoint[];      // Mount points
  initScripts: string[];          // Initialization scripts
  metadata: Map<string, any>;     // Additional metadata
}

// Resource Profile
interface ResourceProfile {
  cpuLimit: number;               // CPU limit (cores)
  memoryLimit: number;            // Memory limit (MB)
  diskLimit: number;              // Disk limit (MB)
  cpuRequest: number;             // CPU request (cores)
  memoryRequest: number;          // Memory request (MB)
  diskRequest: number;            // Disk request (MB)
  gpuEnabled: boolean;            // GPU enabled
  gpuCount?: number;              // GPU count
  gpuType?: string;               // GPU type
}

// Tool Requirement
interface ToolRequirement {
  name: string;                   // Tool name
  version: string;                // Tool version
  installCommand?: string;        // Custom install command
  verifyCommand?: string;         // Verification command
  environmentVariables?: EnvironmentVariable[]; // Tool-specific environment variables
  required: boolean;              // Whether tool is required
}

// Network Policy
interface NetworkPolicy {
  outboundAccess: boolean;        // Outbound network access
  allowedHosts?: string[];        // Allowed outbound hosts
  allowedPorts?: number[];        // Allowed outbound ports
  inboundAccess: boolean;         // Inbound network access
  exposedPorts?: number[];        // Exposed inbound ports
  dnsServers?: string[];          // Custom DNS servers
}

// Security Profile
interface SecurityProfile {
  privileged: boolean;            // Privileged mode
  capabilities: string[];         // Linux capabilities
  readOnlyFilesystem: boolean;    // Read-only filesystem
  runAsUser: number;              // User ID to run as
  runAsGroup: number;             // Group ID to run as
  allowPrivilegeEscalation: boolean; // Allow privilege escalation
  seccompProfile?: string;        // Seccomp profile
  seLinuxOptions?: SELinuxOptions; // SELinux options
}

// SELinux Options
interface SELinuxOptions {
  user: string;                   // SELinux user
  role: string;                   // SELinux role
  type: string;                   // SELinux type
  level: string;                  // SELinux level
}

// Environment Variable
interface EnvironmentVariable {
  name: string;                   // Variable name
  value: string;                  // Variable value
  secret: boolean;                // Whether variable is secret
}

// Mount Point
interface MountPoint {
  name: string;                   // Mount name
  hostPath?: string;              // Host path
  volumeId?: string;              // Volume ID
  mountPath: string;              // Container mount path
  readOnly: boolean;              // Read-only mount
  persistent: boolean;            // Persistent storage
}

// Sandbox Instance
interface SandboxInstance {
  id: string;                     // Unique instance ID
  templateId: string;             // Template ID
  taskId: string;                 // Task ID
  projectId: string;              // Project ID
  status: SandboxStatus;          // Sandbox status
  containerId?: string;           // Container ID
  podId?: string;                 // Kubernetes pod ID
  ipAddress?: string;             // IP address
  hostname?: string;              // Hostname
  createdAt: Date;                // Creation timestamp
  startedAt?: Date;               // Start timestamp
  stoppedAt?: Date;               // Stop timestamp
  expiresAt?: Date;               // Expiration timestamp
  resourceUsage: ResourceUsage;   // Resource usage
  logs: SandboxLog[];             // Sandbox logs
  metadata: Map<string, any>;     // Additional metadata
}

// Sandbox Status
enum SandboxStatus {
  PENDING = 'pending',
  CREATING = 'creating',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

// Resource Usage
interface ResourceUsage {
  cpuUsage: number;               // CPU usage (cores)
  memoryUsage: number;            // Memory usage (MB)
  diskUsage: number;              // Disk usage (MB)
  networkRxBytes: number;         // Network received bytes
  networkTxBytes: number;         // Network transmitted bytes
  lastUpdated: Date;              // Last update timestamp
}

// Sandbox Log
interface SandboxLog {
  timestamp: Date;                // Log timestamp
  level: LogLevel;                // Log level
  message: string;                // Log message
  source: string;                 // Log source
  metadata: Map<string, any>;     // Additional metadata
}

// Log Level
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Sandbox Command
interface SandboxCommand {
  id: string;                     // Unique command ID
  sandboxId: string;              // Sandbox ID
  command: string;                // Command to execute
  workingDirectory?: string;      // Working directory
  environmentVariables?: EnvironmentVariable[]; // Command-specific environment variables
  timeout?: number;               // Timeout in seconds
  status: CommandStatus;          // Command status
  exitCode?: number;              // Exit code
  stdout?: string;                // Standard output
  stderr?: string;                // Standard error
  startedAt?: Date;               // Start timestamp
  completedAt?: Date;             // Completion timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Command Status
enum CommandStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMED_OUT = 'timed_out',
  CANCELLED = 'cancelled'
}
```

### Sandbox Management System

```typescript
// Sandbox Management System
class SandboxManagementSystem {
  private db: Database;
  private templates: Map<string, SandboxTemplate>;
  private instances: Map<string, SandboxInstance>;
  private containerManager: ContainerManager;
  private resourceMonitor: ResourceMonitor;
  private networkManager: NetworkManager;
  private securityManager: SecurityManager;
  
  constructor(db: Database) {
    this.db = db;
    this.templates = new Map();
    this.instances = new Map();
    this.containerManager = new ContainerManager();
    this.resourceMonitor = new ResourceMonitor();
    this.networkManager = new NetworkManager();
    this.securityManager = new SecurityManager();
  }
  
  async initialize(): Promise<void> {
    // Load templates from database
    const templateData = await this.db.sandboxTemplates.findAll();
    for (const data of templateData) {
      const template: SandboxTemplate = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        baseImage: data.base_image,
        resourceProfile: data.resource_profile,
        tools: data.tools,
        networkPolicy: data.network_policy,
        securityProfile: data.security_profile,
        environmentVariables: data.environment_variables,
        mountPoints: data.mount_points,
        initScripts: data.init_scripts,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.templates.set(template.id, template);
    }
    
    // Load active instances from database
    const instanceData = await this.db.sandboxInstances.findByStatus([
      SandboxStatus.PENDING,
      SandboxStatus.CREATING,
      SandboxStatus.RUNNING
    ]);
    
    for (const data of instanceData) {
      const instance: SandboxInstance = {
        id: data.uuid,
        templateId: data.template_id,
        taskId: data.task_id,
        projectId: data.project_id,
        status: data.status as SandboxStatus,
        containerId: data.container_id,
        podId: data.pod_id,
        ipAddress: data.ip_address,
        hostname: data.hostname,
        createdAt: data.created_at,
        startedAt: data.started_at,
        stoppedAt: data.stopped_at,
        expiresAt: data.expires_at,
        resourceUsage: data.resource_usage,
        logs: data.logs || [],
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.instances.set(instance.id, instance);
      
      // Reconnect to running instances
      if (instance.status === SandboxStatus.RUNNING && instance.containerId) {
        this.containerManager.reconnect(instance.containerId);
      }
    }
    
    // Start resource monitoring
    this.resourceMonitor.start();
    
    // Start cleanup job
    this.startCleanupJob();
  }
  
  async createTemplate(templateData: Omit<SandboxTemplate, 'id'>): Promise<string> {
    // Generate template ID
    const templateId = uuidv4();
    
    // Create template object
    const template: SandboxTemplate = {
      id: templateId,
      ...templateData
    };
    
    // Validate template
    this.validateTemplate(template);
    
    // Add to memory
    this.templates.set(templateId, template);
    
    // Store in database
    await this.db.sandboxTemplates.create({
      uuid: templateId,
      name: template.name,
      description: template.description,
      base_image: template.baseImage,
      resource_profile: template.resourceProfile,
      tools: template.tools,
      network_policy: template.networkPolicy,
      security_profile: template.securityProfile,
      environment_variables: template.environmentVariables,
      mount_points: template.mountPoints,
      init_scripts: template.initScripts,
      metadata: Object.fromEntries(template.metadata)
    });
    
    return templateId;
  }
  
  async updateTemplate(templateId: string, updates: Partial<SandboxTemplate>): Promise<void> {
    // Get template
    const template = await this.getTemplate(templateId);
    
    // Apply updates
    const updatedTemplate: SandboxTemplate = {
      ...template,
      ...updates,
      id: template.id, // Ensure ID doesn't change
      metadata: new Map([...template.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated template
    this.validateTemplate(updatedTemplate);
    
    // Update in memory
    this.templates.set(templateId, updatedTemplate);
    
    // Update in database
    await this.db.sandboxTemplates.update(templateId, {
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      base_image: updatedTemplate.baseImage,
      resource_profile: updatedTemplate.resourceProfile,
      tools: updatedTemplate.tools,
      network_policy: updatedTemplate.networkPolicy,
      security_profile: updatedTemplate.securityProfile,
      environment_variables: updatedTemplate.environmentVariables,
      mount_points: updatedTemplate.mountPoints,
      init_scripts: updatedTemplate.initScripts,
      metadata: Object.fromEntries(updatedTemplate.metadata)
    });
  }
  
  async createSandbox(templateId: string, taskId: string, projectId: string, options: {
    expiresIn?: number; // Expiration time in seconds
    environmentVariables?: EnvironmentVariable[]; // Additional environment variables
    mountPoints?: MountPoint[]; // Additional mount points
    metadata?: Map<string, any>; // Additional metadata
  } = {}): Promise<string> {
    // Get template
    const template = await this.getTemplate(templateId);
    
    // Generate sandbox ID
    const sandboxId = uuidv4();
    
    // Create sandbox instance
    const instance: SandboxInstance = {
      id: sandboxId,
      templateId,
      taskId,
      projectId,
      status: SandboxStatus.PENDING,
      createdAt: new Date(),
      expiresAt: options.expiresIn ? new Date(Date.now() + options.expiresIn * 1000) : undefined,
      resourceUsage: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkRxBytes: 0,
        networkTxBytes: 0,
        lastUpdated: new Date()
      },
      logs: [],
      metadata: new Map([...(options.metadata || new Map())])
    };
    
    // Add to memory
    this.instances.set(sandboxId, instance);
    
    // Store in database
    await this.db.sandboxInstances.create({
      uuid: sandboxId,
      template_id: instance.templateId,
      task_id: instance.taskId,
      project_id: instance.projectId,
      status: instance.status,
      created_at: instance.createdAt,
      expires_at: instance.expiresAt,
      resource_usage: instance.resourceUsage,
      logs: instance.logs,
      metadata: Object.fromEntries(instance.metadata)
    });
    
    // Start sandbox asynchronously
    this.startSandbox(sandboxId, options).catch(error => {
      console.error(`Error starting sandbox ${sandboxId}:`, error);
      this.logSandboxError(sandboxId, 'Failed to start sandbox', error);
    });
    
    return sandboxId;
  }
  
  async startSandbox(sandboxId: string, options: {
    environmentVariables?: EnvironmentVariable[];
    mountPoints?: MountPoint[];
  } = {}): Promise<void> {
    // Get sandbox instance
    const instance = await this.getSandboxInstance(sandboxId);
    
    // Check if sandbox can be started
    if (instance.status !== SandboxStatus.PENDING) {
      throw new Error(`Cannot start sandbox ${sandboxId} with status ${instance.status}`);
    }
    
    // Get template
    const template = await this.getTemplate(instance.templateId);
    
    // Update status
    instance.status = SandboxStatus.CREATING;
    await this.updateSandboxInstance(instance);
    
    try {
      // Prepare container configuration
      const containerConfig = await this.prepareContainerConfig(template, instance, options);
      
      // Create container
      const containerId = await this.containerManager.createContainer(containerConfig);
      instance.containerId = containerId;
      
      // Start container
      await this.containerManager.startContainer(containerId);
      
      // Get container info
      const containerInfo = await this.containerManager.getContainerInfo(containerId);
      instance.ipAddress = containerInfo.ipAddress;
      instance.hostname = containerInfo.hostname;
      
      // Update status
      instance.status = SandboxStatus.RUNNING;
      instance.startedAt = new Date();
      await this.updateSandboxInstance(instance);
      
      // Start resource monitoring for this sandbox
      this.resourceMonitor.addSandbox(sandboxId, containerId);
      
      // Log success
      this.logSandboxInfo(sandboxId, 'Sandbox started successfully');
    } catch (error) {
      // Update status to failed
      instance.status = SandboxStatus.FAILED;
      await this.updateSandboxInstance(instance);
      
      // Log error
      this.logSandboxError(sandboxId, 'Failed to start sandbox', error);
      
      // Rethrow error
      throw error;
    }
  }
  
  async stopSandbox(sandboxId: string): Promise<void> {
    // Get sandbox instance
    const instance = await this.getSandboxInstance(sandboxId);
    
    // Check if sandbox can be stopped
    if (instance.status !== SandboxStatus.RUNNING) {
      throw new Error(`Cannot stop sandbox ${sandboxId} with status ${instance.status}`);
    }
    
    // Update status
    instance.status = SandboxStatus.STOPPING;
    await this.updateSandboxInstance(instance);
    
    try {
      // Stop container
      await this.containerManager.stopContainer(instance.containerId);
      
      // Update status
      instance.status = SandboxStatus.STOPPED;
      instance.stoppedAt = new Date();
      await this.updateSandboxInstance(instance);
      
      // Stop resource monitoring for this sandbox
      this.resourceMonitor.removeSandbox(sandboxId);
      
      // Log success
      this.logSandboxInfo(sandboxId, 'Sandbox stopped successfully');
    } catch (error) {
      // Log error
      this.logSandboxError(sandboxId, 'Failed to stop sandbox', error);
      
      // Rethrow error
      throw error;
    }
  }
  
  async executeSandboxCommand(sandboxId: string, commandData: {
    command: string;
    workingDirectory?: string;
    environmentVariables?: EnvironmentVariable[];
    timeout?: number;
  }): Promise<SandboxCommand> {
    // Get sandbox instance
    const instance = await this.getSandboxInstance(sandboxId);
    
    // Check if sandbox is running
    if (instance.status !== SandboxStatus.RUNNING) {
      throw new Error(`Cannot execute command in sandbox ${sandboxId} with status ${instance.status}`);
    }
    
    // Generate command ID
    const commandId = uuidv4();
    
    // Create command object
    const command: SandboxCommand = {
      id: commandId,
      sandboxId,
      command: commandData.command,
      workingDirectory: commandData.workingDirectory,
      environmentVariables: commandData.environmentVariables,
      timeout: commandData.timeout,
      status: CommandStatus.PENDING,
      metadata: new Map()
    };
    
    // Store in database
    await this.db.sandboxCommands.create({
      uuid: commandId,
      sandbox_id: command.sandboxId,
      command: command.command,
      working_directory: command.workingDirectory,
      environment_variables: command.environmentVariables,
      timeout: command.timeout,
      status: command.status,
      metadata: Object.fromEntries(command.metadata)
    });
    
    // Execute command asynchronously
    this.executeCommand(command).catch(error => {
      console.error(`Error executing command ${commandId} in sandbox ${sandboxId}:`, error);
    });
    
    return command;
  }
  
  async getSandboxCommand(commandId: string): Promise<SandboxCommand> {
    // Get from database
    const commandData = await this.db.sandboxCommands.findByUuid(commandId);
    if (!commandData) {
      throw new Error(`Command ${commandId} not found`);
    }
    
    // Convert to SandboxCommand object
    const command: SandboxCommand = {
      id: commandData.uuid,
      sandboxId: commandData.sandbox_id,
      command: commandData.command,
      workingDirectory: commandData.working_directory,
      environmentVariables: commandData.environment_variables,
      timeout: commandData.timeout,
      status: commandData.status as CommandStatus,
      exitCode: commandData.exit_code,
      stdout: commandData.stdout,
      stderr: commandData.stderr,
      startedAt: commandData.started_at,
      completedAt: commandData.completed_at,
      metadata: new Map(Object.entries(commandData.metadata || {}))
    };
    
    return command;
  }
  
  async getTemplate(templateId: string): Promise<SandboxTemplate> {
    // Check in memory
    if (this.templates.has(templateId)) {
      return this.templates.get(templateId);
    }
    
    // Get from database
    const templateData = await this.db.sandboxTemplates.findByUuid(templateId);
    if (!templateData) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    // Convert to SandboxTemplate object
    const template: SandboxTemplate = {
      id: templateData.uuid,
      name: templateData.name,
      description: templateData.description,
      baseImage: templateData.base_image,
      resourceProfile: templateData.resource_profile,
      tools: templateData.tools,
      networkPolicy: templateData.network_policy,
      securityProfile: templateData.security_profile,
      environmentVariables: templateData.environment_variables,
      mountPoints: templateData.mount_points,
      initScripts: templateData.init_scripts,
      metadata: new Map(Object.entries(templateData.metadata || {}))
    };
    
    // Add to memory
    this.templates.set(templateId, template);
    
    return template;
  }
  
  async getSandboxInstance(sandboxId: string): Promise<SandboxInstance> {
    // Check in memory
    if (this.instances.has(sandboxId)) {
      return this.instances.get(sandboxId);
    }
    
    // Get from database
    const instanceData = await this.db.sandboxInstances.findByUuid(sandboxId);
    if (!instanceData) {
      throw new Error(`Sandbox instance ${sandboxId} not found`);
    }
    
    // Convert to SandboxInstance object
    const instance: SandboxInstance = {
      id: instanceData.uuid,
      templateId: instanceData.template_id,
      taskId: instanceData.task_id,
      projectId: instanceData.project_id,
      status: instanceData.status as SandboxStatus,
      containerId: instanceData.container_id,
      podId: instanceData.pod_id,
      ipAddress: instanceData.ip_address,
      hostname: instanceData.hostname,
      createdAt: instanceData.created_at,
      startedAt: instanceData.started_at,
      stoppedAt: instanceData.stopped_at,
      expiresAt: instanceData.expires_at,
      resourceUsage: instanceData.resource_usage,
      logs: instanceData.logs || [],
      metadata: new Map(Object.entries(instanceData.metadata || {}))
    };
    
    // Add to memory
    this.instances.set(sandboxId, instance);
    
    return instance;
  }
  
  private async updateSandboxInstance(instance: SandboxInstance): Promise<void> {
    // Update in memory
    this.instances.set(instance.id, instance);
    
    // Update in database
    await this.db.sandboxInstances.update(instance.id, {
      status: instance.status,
      container_id: instance.containerId,
      pod_id: instance.podId,
      ip_address: instance.ipAddress,
      hostname: instance.hostname,
      started_at: instance.startedAt,
      stopped_at: instance.stoppedAt,
      expires_at: instance.expiresAt,
      resource_usage: instance.resourceUsage,
      logs: instance.logs,
      metadata: Object.fromEntries(instance.metadata)
    });
  }
  
  private async executeCommand(command: SandboxCommand): Promise<void> {
    // Get sandbox instance
    const instance = await this.getSandboxInstance(command.sandboxId);
    
    // Update command status
    command.status = CommandStatus.RUNNING;
    command.startedAt = new Date();
    await this.updateSandboxCommand(command);
    
    try {
      // Execute command in container
      const result = await this.containerManager.executeCommand(
        instance.containerId,
        command.command,
        command.workingDirectory,
        command.environmentVariables,
        command.timeout
      );
      
      // Update command with result
      command.status = CommandStatus.COMPLETED;
      command.exitCode = result.exitCode;
      command.stdout = result.stdout;
      command.stderr = result.stderr;
      command.completedAt = new Date();
      
      // Check if command failed
      if (result.exitCode !== 0) {
        command.status = CommandStatus.FAILED;
      }
    } catch (error) {
      // Update command with error
      command.status = CommandStatus.FAILED;
      command.stderr = error.message;
      command.exitCode = -1;
      command.completedAt = new Date();
      
      // Check if command timed out
      if (error.code === 'TIMEOUT') {
        command.status = CommandStatus.TIMED_OUT;
      }
    }
    
    // Update command in database
    await this.updateSandboxCommand(command);
  }
  
  private async updateSandboxCommand(command: SandboxCommand): Promise<void> {
    // Update in database
    await this.db.sandboxCommands.update(command.id, {
      status: command.status,
      exit_code: command.exitCode,
      stdout: command.stdout,
      stderr: command.stderr,
      started_at: command.startedAt,
      completed_at: command.completedAt,
      metadata: Object.fromEntries(command.metadata)
    });
  }
  
  private async prepareContainerConfig(
    template: SandboxTemplate,
    instance: SandboxInstance,
    options: {
      environmentVariables?: EnvironmentVariable[];
      mountPoints?: MountPoint[];
    }
  ): Promise<any> {
    // Merge environment variables
    const environmentVariables = [
      ...template.environmentVariables,
      ...(options.environmentVariables || [])
    ];
    
    // Merge mount points
    const mountPoints = [
      ...template.mountPoints,
      ...(options.mountPoints || [])
    ];
    
    // Prepare container configuration
    const containerConfig = {
      image: template.baseImage,
      name: `sandbox-${instance.id}`,
      hostname: `sandbox-${instance.id.substring(0, 8)}`,
      env: environmentVariables.map(ev => ({ name: ev.name, value: ev.value, secret: ev.secret })),
      mounts: mountPoints.map(mp => ({
        name: mp.name,
        hostPath: mp.hostPath,
        volumeId: mp.volumeId,
        mountPath: mp.mountPath,
        readOnly: mp.readOnly,
        persistent: mp.persistent
      })),
      resources: {
        limits: {
          cpu: template.resourceProfile.cpuLimit,
          memory: `${template.resourceProfile.memoryLimit}Mi`,
          'ephemeral-storage': `${template.resourceProfile.diskLimit}Mi`
        },
        requests: {
          cpu: template.resourceProfile.cpuRequest,
          memory: `${template.resourceProfile.memoryRequest}Mi`,
          'ephemeral-storage': `${template.resourceProfile.diskRequest}Mi`
        }
      },
      securityContext: {
        privileged: template.securityProfile.privileged,
        capabilities: {
          add: template.securityProfile.capabilities
        },
        readOnlyRootFilesystem: template.securityProfile.readOnlyFilesystem,
        runAsUser: template.securityProfile.runAsUser,
        runAsGroup: template.securityProfile.runAsGroup,
        allowPrivilegeEscalation: template.securityProfile.allowPrivilegeEscalation,
        seccompProfile: template.securityProfile.seccompProfile ? {
          type: 'Localhost',
          localhostProfile: template.securityProfile.seccompProfile
        } : undefined,
        seLinuxOptions: template.securityProfile.seLinuxOptions
      },
      networking: {
        outboundAccess: template.networkPolicy.outboundAccess,
        allowedHosts: template.networkPolicy.allowedHosts,
        allowedPorts: template.networkPolicy.allowedPorts,
        inboundAccess: template.networkPolicy.inboundAccess,
        exposedPorts: template.networkPolicy.exposedPorts,
        dnsServers: template.networkPolicy.dnsServers
      },
      labels: {
        'sandbox-id': instance.id,
        'task-id': instance.taskId,
        'project-id': instance.projectId
      },
      initScripts: template.initScripts
    };
    
    // Add GPU configuration if enabled
    if (template.resourceProfile.gpuEnabled && template.resourceProfile.gpuCount > 0) {
      containerConfig.resources.limits['nvidia.com/gpu'] = template.resourceProfile.gpuCount;
      if (template.resourceProfile.gpuType) {
        containerConfig.resources.limits[`nvidia.com/${template.resourceProfile.gpuType}`] = template.resourceProfile.gpuCount;
      }
    }
    
    return containerConfig;
  }
  
  private logSandboxInfo(sandboxId: string, message: string): void {
    this.logSandbox(sandboxId, LogLevel.INFO, message);
  }
  
  private logSandboxError(sandboxId: string, message: string, error?: any): void {
    this.logSandbox(sandboxId, LogLevel.ERROR, message, {
      error: error ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
  
  private async logSandbox(sandboxId: string, level: LogLevel, message: string, metadata: any = {}): Promise<void> {
    try {
      // Get sandbox instance
      const instance = await this.getSandboxInstance(sandboxId);
      
      // Create log entry
      const logEntry: SandboxLog = {
        timestamp: new Date(),
        level,
        message,
        source: 'system',
        metadata: new Map(Object.entries(metadata))
      };
      
      // Add to logs
      instance.logs.push(logEntry);
      
      // Update instance
      await this.updateSandboxInstance(instance);
    } catch (error) {
      console.error(`Error logging to sandbox ${sandboxId}:`, error);
    }
  }
  
  private validateTemplate(template: SandboxTemplate): void {
    // Check required fields
    if (!template.name) {
      throw new Error('Template name is required');
    }
    
    if (!template.baseImage) {
      throw new Error('Template base image is required');
    }
    
    // Validate resource profile
    if (!template
