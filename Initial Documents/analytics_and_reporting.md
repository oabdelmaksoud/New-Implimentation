# Analytics and Reporting

## Overview

The Analytics and Reporting component is a critical part of the Continuous Operation and Monitoring phase. It enables the system to collect, analyze, and visualize data about system performance, agent activities, and user interactions. This document outlines the detailed implementation plan for the Analytics and Reporting system.

## Objectives

- Implement comprehensive data collection
- Create real-time analytics processing
- Develop interactive visualization dashboards
- Implement automated reporting mechanisms

## Tasks

1. **Data Collection**
   - Implement system metrics collection
   - Create agent activity tracking
   - Develop user interaction logging
   - Implement business metrics collection

2. **Analytics Processing**
   - Create real-time data processing
   - Implement historical data analysis
   - Develop trend detection
   - Create anomaly detection

3. **Visualization**
   - Implement interactive dashboards
   - Create customizable charts and graphs
   - Develop drill-down capabilities
   - Implement real-time updates

4. **Reporting**
   - Create scheduled reports
   - Implement alert-based reports
   - Develop custom report generation
   - Create export capabilities

## Micro-Level Implementation Details

### Analytics Structure

```typescript
// Data Source
interface DataSource {
  id: string;                     // Unique source ID
  name: string;                   // Source name
  type: DataSourceType;           // Source type
  description: string;            // Source description
  connectionDetails: any;         // Connection details
  schema: DataSchema;             // Data schema
  status: DataSourceStatus;       // Source status
  lastSyncTime?: Date;            // Last sync timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Data Source Type
enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  LOG = 'log',
  METRICS = 'metrics',
  EVENTS = 'events',
  CUSTOM = 'custom'
}

// Data Schema
interface DataSchema {
  fields: SchemaField[];          // Schema fields
  primaryKey?: string[];          // Primary key fields
  timestampField?: string;        // Timestamp field
  partitionFields?: string[];     // Partition fields
}

// Schema Field
interface SchemaField {
  name: string;                   // Field name
  type: FieldType;                // Field type
  description?: string;           // Field description
  required: boolean;              // Whether field is required
  defaultValue?: any;             // Default value
  constraints?: FieldConstraint[]; // Field constraints
}

// Field Type
enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  TIMESTAMP = 'timestamp',
  OBJECT = 'object',
  ARRAY = 'array',
  BINARY = 'binary'
}

// Field Constraint
interface FieldConstraint {
  type: ConstraintType;           // Constraint type
  value: any;                     // Constraint value
}

// Constraint Type
enum ConstraintType {
  MIN = 'min',
  MAX = 'max',
  PATTERN = 'pattern',
  ENUM = 'enum',
  LENGTH = 'length',
  UNIQUE = 'unique'
}

// Data Source Status
enum DataSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing'
}

// Data Pipeline
interface DataPipeline {
  id: string;                     // Unique pipeline ID
  name: string;                   // Pipeline name
  description: string;            // Pipeline description
  sourceId: string;               // Source ID
  destinationId: string;          // Destination ID
  transformations: Transformation[]; // Transformations
  schedule: string;               // Cron schedule
  status: PipelineStatus;         // Pipeline status
  lastRunTime?: Date;             // Last run timestamp
  nextRunTime?: Date;             // Next run timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Transformation
interface Transformation {
  id: string;                     // Unique transformation ID
  name: string;                   // Transformation name
  type: TransformationType;       // Transformation type
  config: any;                    // Transformation config
  order: number;                  // Transformation order
}

// Transformation Type
enum TransformationType {
  FILTER = 'filter',
  MAP = 'map',
  AGGREGATE = 'aggregate',
  JOIN = 'join',
  WINDOW = 'window',
  ENRICH = 'enrich',
  CUSTOM = 'custom'
}

// Pipeline Status
enum PipelineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  RUNNING = 'running',
  PAUSED = 'paused'
}

// Data Warehouse
interface DataWarehouse {
  id: string;                     // Unique warehouse ID
  name: string;                   // Warehouse name
  description: string;            // Warehouse description
  connectionDetails: any;         // Connection details
  schemas: Map<string, DataSchema>; // Data schemas
  status: WarehouseStatus;        // Warehouse status
  lastUpdateTime?: Date;          // Last update timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Warehouse Status
enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}
```

### Reporting Structure

```typescript
// Dashboard
interface Dashboard {
  id: string;                     // Unique dashboard ID
  name: string;                   // Dashboard name
  description: string;            // Dashboard description
  layout: DashboardLayout;        // Dashboard layout
  widgets: DashboardWidget[];     // Dashboard widgets
  filters: DashboardFilter[];     // Dashboard filters
  refreshInterval?: number;       // Refresh interval in seconds
  owner: string;                  // Owner ID
  permissions: Permission[];      // Dashboard permissions
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Dashboard Layout
interface DashboardLayout {
  type: LayoutType;               // Layout type
  config: any;                    // Layout config
}

// Layout Type
enum LayoutType {
  GRID = 'grid',
  FLEX = 'flex',
  FIXED = 'fixed',
  CUSTOM = 'custom'
}

// Dashboard Widget
interface DashboardWidget {
  id: string;                     // Unique widget ID
  name: string;                   // Widget name
  type: WidgetType;               // Widget type
  dataSource: WidgetDataSource;   // Widget data source
  visualization: Visualization;   // Widget visualization
  position: WidgetPosition;       // Widget position
  size: WidgetSize;               // Widget size
  refreshInterval?: number;       // Refresh interval in seconds
  drillDown?: DrillDownConfig;    // Drill-down config
  metadata: Map<string, any>;     // Additional metadata
}

// Widget Type
enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC = 'metric',
  TEXT = 'text',
  IMAGE = 'image',
  MAP = 'map',
  CUSTOM = 'custom'
}

// Widget Data Source
interface WidgetDataSource {
  type: WidgetDataSourceType;     // Data source type
  config: any;                    // Data source config
  query: string;                  // Data source query
  parameters: Map<string, any>;   // Query parameters
}

// Widget Data Source Type
enum WidgetDataSourceType {
  WAREHOUSE = 'warehouse',
  API = 'api',
  STATIC = 'static',
  CUSTOM = 'custom'
}

// Visualization
interface Visualization {
  type: VisualizationType;        // Visualization type
  config: any;                    // Visualization config
}

// Visualization Type
enum VisualizationType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area',
  TABLE = 'table',
  METRIC = 'metric',
  HEATMAP = 'heatmap',
  MAP = 'map',
  CUSTOM = 'custom'
}

// Widget Position
interface WidgetPosition {
  x: number;                      // X position
  y: number;                      // Y position
  z?: number;                     // Z position
}

// Widget Size
interface WidgetSize {
  width: number;                  // Width
  height: number;                 // Height
}

// Drill-Down Config
interface DrillDownConfig {
  enabled: boolean;               // Drill-down enabled
  targetDashboardId?: string;     // Target dashboard ID
  parameterMapping: Map<string, string>; // Parameter mapping
}

// Dashboard Filter
interface DashboardFilter {
  id: string;                     // Unique filter ID
  name: string;                   // Filter name
  type: FilterType;               // Filter type
  field: string;                  // Filter field
  defaultValue?: any;             // Default value
  options?: FilterOption[];       // Filter options
  required: boolean;              // Whether filter is required
  multiSelect: boolean;           // Whether filter allows multiple values
  metadata: Map<string, any>;     // Additional metadata
}

// Filter Type
enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DROPDOWN = 'dropdown',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  RANGE = 'range',
  CUSTOM = 'custom'
}

// Filter Option
interface FilterOption {
  value: any;                     // Option value
  label: string;                  // Option label
}

// Permission
interface Permission {
  userId: string;                 // User ID
  role: PermissionRole;           // Permission role
}

// Permission Role
enum PermissionRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  NONE = 'none'
}

// Report
interface Report {
  id: string;                     // Unique report ID
  name: string;                   // Report name
  description: string;            // Report description
  type: ReportType;               // Report type
  template: ReportTemplate;       // Report template
  dataSource: ReportDataSource;   // Report data source
  schedule?: ReportSchedule;      // Report schedule
  delivery: ReportDelivery[];     // Report delivery
  parameters: Map<string, any>;   // Report parameters
  owner: string;                  // Owner ID
  permissions: Permission[];      // Report permissions
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  metadata: Map<string, any>;     // Additional metadata
}

// Report Type
enum ReportType {
  DASHBOARD = 'dashboard',
  TABULAR = 'tabular',
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  CUSTOM = 'custom'
}

// Report Template
interface ReportTemplate {
  id: string;                     // Unique template ID
  name: string;                   // Template name
  type: TemplateType;             // Template type
  content: any;                   // Template content
  version: string;                // Template version
}

// Template Type
enum TemplateType {
  HTML = 'html',
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  CUSTOM = 'custom'
}

// Report Data Source
interface ReportDataSource {
  type: ReportDataSourceType;     // Data source type
  config: any;                    // Data source config
  query: string;                  // Data source query
  parameters: Map<string, any>;   // Query parameters
}

// Report Data Source Type
enum ReportDataSourceType {
  WAREHOUSE = 'warehouse',
  API = 'api',
  DASHBOARD = 'dashboard',
  CUSTOM = 'custom'
}

// Report Schedule
interface ReportSchedule {
  type: ScheduleType;             // Schedule type
  config: any;                    // Schedule config
  enabled: boolean;               // Schedule enabled
  nextRunTime?: Date;             // Next run timestamp
  lastRunTime?: Date;             // Last run timestamp
}

// Schedule Type
enum ScheduleType {
  CRON = 'cron',
  INTERVAL = 'interval',
  ONCE = 'once',
  CUSTOM = 'custom'
}

// Report Delivery
interface ReportDelivery {
  type: DeliveryType;             // Delivery type
  config: any;                    // Delivery config
  enabled: boolean;               // Delivery enabled
}

// Delivery Type
enum DeliveryType {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  S3 = 's3',
  FTP = 'ftp',
  CUSTOM = 'custom'
}
```

### Analytics System

```typescript
// Analytics System
class AnalyticsSystem {
  private db: Database;
  private dataSources: Map<string, DataSource>;
  private pipelines: Map<string, DataPipeline>;
  private warehouses: Map<string, DataWarehouse>;
  private dashboards: Map<string, Dashboard>;
  private reports: Map<string, Report>;
  private pipelineExecutor: PipelineExecutor;
  private reportGenerator: ReportGenerator;
  
  constructor(db: Database) {
    this.db = db;
    this.dataSources = new Map();
    this.pipelines = new Map();
    this.warehouses = new Map();
    this.dashboards = new Map();
    this.reports = new Map();
    this.pipelineExecutor = new PipelineExecutor();
    this.reportGenerator = new ReportGenerator();
  }
  
  async initialize(): Promise<void> {
    // Load data sources from database
    const dataSourceData = await this.db.dataSources.findAll();
    for (const data of dataSourceData) {
      const dataSource: DataSource = {
        id: data.uuid,
        name: data.name,
        type: data.type as DataSourceType,
        description: data.description,
        connectionDetails: data.connection_details,
        schema: data.schema,
        status: data.status as DataSourceStatus,
        lastSyncTime: data.last_sync_time,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.dataSources.set(dataSource.id, dataSource);
    }
    
    // Load pipelines from database
    const pipelineData = await this.db.dataPipelines.findAll();
    for (const data of pipelineData) {
      const pipeline: DataPipeline = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        sourceId: data.source_id,
        destinationId: data.destination_id,
        transformations: data.transformations,
        schedule: data.schedule,
        status: data.status as PipelineStatus,
        lastRunTime: data.last_run_time,
        nextRunTime: data.next_run_time,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.pipelines.set(pipeline.id, pipeline);
    }
    
    // Load warehouses from database
    const warehouseData = await this.db.dataWarehouses.findAll();
    for (const data of warehouseData) {
      const warehouse: DataWarehouse = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        connectionDetails: data.connection_details,
        schemas: new Map(Object.entries(data.schemas || {})),
        status: data.status as WarehouseStatus,
        lastUpdateTime: data.last_update_time,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.warehouses.set(warehouse.id, warehouse);
    }
    
    // Load dashboards from database
    const dashboardData = await this.db.dashboards.findAll();
    for (const data of dashboardData) {
      const dashboard: Dashboard = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        layout: data.layout,
        widgets: data.widgets,
        filters: data.filters,
        refreshInterval: data.refresh_interval,
        owner: data.owner,
        permissions: data.permissions,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.dashboards.set(dashboard.id, dashboard);
    }
    
    // Load reports from database
    const reportData = await this.db.reports.findAll();
    for (const data of reportData) {
      const report: Report = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        type: data.type as ReportType,
        template: data.template,
        dataSource: data.data_source,
        schedule: data.schedule,
        delivery: data.delivery,
        parameters: new Map(Object.entries(data.parameters || {})),
        owner: data.owner,
        permissions: data.permissions,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.reports.set(report.id, report);
    }
    
    // Start pipeline scheduler
    this.startPipelineScheduler();
    
    // Start report scheduler
    this.startReportScheduler();
  }
  
  // Data Source Methods
  
  async createDataSource(sourceData: Omit<DataSource, 'id' | 'status' | 'lastSyncTime'>): Promise<string> {
    // Generate data source ID
    const sourceId = uuidv4();
    
    // Create data source object
    const dataSource: DataSource = {
      id: sourceId,
      ...sourceData,
      status: DataSourceStatus.INACTIVE,
      metadata: sourceData.metadata || new Map()
    };
    
    // Validate data source
    this.validateDataSource(dataSource);
    
    // Add to memory
    this.dataSources.set(sourceId, dataSource);
    
    // Store in database
    await this.db.dataSources.create({
      uuid: sourceId,
      name: dataSource.name,
      type: dataSource.type,
      description: dataSource.description,
      connection_details: dataSource.connectionDetails,
      schema: dataSource.schema,
      status: dataSource.status,
      metadata: Object.fromEntries(dataSource.metadata)
    });
    
    return sourceId;
  }
  
  async activateDataSource(sourceId: string): Promise<void> {
    // Get data source
    const dataSource = await this.getDataSource(sourceId);
    
    // Check if data source can be activated
    if (dataSource.status === DataSourceStatus.ACTIVE) {
      return; // Already active
    }
    
    // Test connection
    await this.testDataSourceConnection(sourceId);
    
    // Update status
    dataSource.status = DataSourceStatus.ACTIVE;
    
    // Update in memory
    this.dataSources.set(sourceId, dataSource);
    
    // Update in database
    await this.db.dataSources.update(sourceId, {
      status: dataSource.status
    });
  }
  
  async syncDataSource(sourceId: string): Promise<void> {
    // Get data source
    const dataSource = await this.getDataSource(sourceId);
    
    // Check if data source is active
    if (dataSource.status !== DataSourceStatus.ACTIVE) {
      throw new Error(`Data source ${sourceId} is not active`);
    }
    
    // Update status
    dataSource.status = DataSourceStatus.SYNCING;
    
    // Update in memory
    this.dataSources.set(sourceId, dataSource);
    
    // Update in database
    await this.db.dataSources.update(sourceId, {
      status: dataSource.status
    });
    
    try {
      // Perform sync based on data source type
      switch (dataSource.type) {
        case DataSourceType.DATABASE:
          await this.syncDatabaseSource(dataSource);
          break;
        case DataSourceType.API:
          await this.syncApiSource(dataSource);
          break;
        case DataSourceType.LOG:
          await this.syncLogSource(dataSource);
          break;
        case DataSourceType.METRICS:
          await this.syncMetricsSource(dataSource);
          break;
        case DataSourceType.EVENTS:
          await this.syncEventsSource(dataSource);
          break;
        case DataSourceType.CUSTOM:
          await this.syncCustomSource(dataSource);
          break;
        default:
          throw new Error(`Unsupported data source type: ${dataSource.type}`);
      }
      
      // Update status and sync time
      dataSource.status = DataSourceStatus.ACTIVE;
      dataSource.lastSyncTime = new Date();
      
      // Update in memory
      this.dataSources.set(sourceId, dataSource);
      
      // Update in database
      await this.db.dataSources.update(sourceId, {
        status: dataSource.status,
        last_sync_time: dataSource.lastSyncTime
      });
    } catch (error) {
      // Update status to error
      dataSource.status = DataSourceStatus.ERROR;
      
      // Update in memory
      this.dataSources.set(sourceId, dataSource);
      
      // Update in database
      await this.db.dataSources.update(sourceId, {
        status: dataSource.status
      });
      
      // Rethrow error
      throw error;
    }
  }
  
  // Pipeline Methods
  
  async createPipeline(pipelineData: Omit<DataPipeline, 'id' | 'status' | 'lastRunTime' | 'nextRunTime'>): Promise<string> {
    // Generate pipeline ID
    const pipelineId = uuidv4();
    
    // Create pipeline object
    const pipeline: DataPipeline = {
      id: pipelineId,
      ...pipelineData,
      status: PipelineStatus.INACTIVE,
      metadata: pipelineData.metadata || new Map()
    };
    
    // Validate pipeline
    this.validatePipeline(pipeline);
    
    // Add to memory
    this.pipelines.set(pipelineId, pipeline);
    
    // Store in database
    await this.db.dataPipelines.create({
      uuid: pipelineId,
      name: pipeline.name,
      description: pipeline.description,
      source_id: pipeline.sourceId,
      destination_id: pipeline.destinationId,
      transformations: pipeline.transformations,
      schedule: pipeline.schedule,
      status: pipeline.status,
      metadata: Object.fromEntries(pipeline.metadata)
    });
    
    return pipelineId;
  }
  
  async activatePipeline(pipelineId: string): Promise<void> {
    // Get pipeline
    const pipeline = await this.getPipeline(pipelineId);
    
    // Check if pipeline can be activated
    if (pipeline.status === PipelineStatus.ACTIVE) {
      return; // Already active
    }
    
    // Validate source and destination
    await this.getDataSource(pipeline.sourceId);
    await this.getDataWarehouse(pipeline.destinationId);
    
    // Update status
    pipeline.status = PipelineStatus.ACTIVE;
    
    // Calculate next run time
    pipeline.nextRunTime = this.calculateNextRunTime(pipeline.schedule);
    
    // Update in memory
    this.pipelines.set(pipelineId, pipeline);
    
    // Update in database
    await this.db.dataPipelines.update(pipelineId, {
      status: pipeline.status,
      next_run_time: pipeline.nextRunTime
    });
  }
  
  async executePipeline(pipelineId: string): Promise<void> {
    // Get pipeline
    const pipeline = await this.getPipeline(pipelineId);
    
    // Check if pipeline can be executed
    if (pipeline.status !== PipelineStatus.ACTIVE && pipeline.status !== PipelineStatus.INACTIVE) {
      throw new Error(`Pipeline ${pipelineId} cannot be executed with status ${pipeline.status}`);
    }
    
    // Update status
    pipeline.status = PipelineStatus.RUNNING;
    
    // Update in memory
    this.pipelines.set(pipelineId, pipeline);
    
    // Update in database
    await this.db.dataPipelines.update(pipelineId, {
      status: pipeline.status
    });
    
    try {
      // Get source and destination
      const source = await this.getDataSource(pipeline.sourceId);
      const destination = await this.getDataWarehouse(pipeline.destinationId);
      
      // Execute pipeline
      await this.pipelineExecutor.execute(pipeline, source, destination);
      
      // Update status and run times
      pipeline.status = PipelineStatus.ACTIVE;
      pipeline.lastRunTime = new Date();
      pipeline.nextRunTime = this.calculateNextRunTime(pipeline.schedule);
      
      // Update in memory
      this.pipelines.set(pipelineId, pipeline);
      
      // Update in database
      await this.db.dataPipelines.update(pipelineId, {
        status: pipeline.status,
        last_run_time: pipeline.lastRunTime,
        next_run_time: pipeline.nextRunTime
      });
    } catch (error) {
      // Update status to error
      pipeline.status = PipelineStatus.ERROR;
      
      // Update in memory
      this.pipelines.set(pipelineId, pipeline);
      
      // Update in database
      await this.db.dataPipelines.update(pipelineId, {
        status: pipeline.status
      });
      
      // Rethrow error
      throw error;
    }
  }
  
  // Dashboard Methods
  
  async createDashboard(dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Generate dashboard ID
    const dashboardId = uuidv4();
    
    // Create dashboard object
    const dashboard: Dashboard = {
      id: dashboardId,
      ...dashboardData,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: dashboardData.metadata || new Map()
    };
    
    // Validate dashboard
    this.validateDashboard(dashboard);
    
    // Add to memory
    this.dashboards.set(dashboardId, dashboard);
    
    // Store in database
    await this.db.dashboards.create({
      uuid: dashboardId,
      name: dashboard.name,
      description: dashboard.description,
      layout: dashboard.layout,
      widgets: dashboard.widgets,
      filters: dashboard.filters,
      refresh_interval: dashboard.refreshInterval,
      owner: dashboard.owner,
      permissions: dashboard.permissions,
      created_at: dashboard.createdAt,
      updated_at: dashboard.updatedAt,
      metadata: Object.fromEntries(dashboard.metadata)
    });
    
    return dashboardId;
  }
  
  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<void> {
    // Get dashboard
    const dashboard = await this.getDashboard(dashboardId);
    
    // Apply updates
    const updatedDashboard: Dashboard = {
      ...dashboard,
      ...updates,
      id: dashboard.id, // Ensure ID doesn't change
      updatedAt: new Date(),
      metadata: new Map([...dashboard.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated dashboard
    this.validateDashboard(updatedDashboard);
    
    // Update in memory
    this.dashboards.set(dashboardId, updatedDashboard);
    
    // Update in database
    await this.db.dashboards.update(dashboardId, {
      name: updatedDashboard.name,
      description: updatedDashboard.description,
      layout: updatedDashboard.layout,
      widgets: updatedDashboard.widgets,
      filters: updatedDashboard.filters,
      refresh_interval: updatedDashboard.refreshInterval,
      owner: updatedDashboard.owner,
      permissions: updatedDashboard.permissions,
      updated_at: updatedDashboard.updatedAt,
      metadata: Object.fromEntries(updatedDashboard.metadata)
    });
  }
  
  // Report Methods
  
  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Generate report ID
    const reportId = uuidv4();
    
    // Create report object
    const report: Report = {
      id: reportId,
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date(),
      parameters: reportData.parameters || new Map(),
      metadata: reportData.metadata || new Map()
    };
    
    // Validate report
    this.validateReport(report);
    
    // Add to memory
    this.reports.set(reportId, report);
    
    // Store in database
    await this.db.reports.create({
      uuid: reportId,
      name: report.name,
      description: report.description,
      type: report.type,
      template: report.template,
      data_source: report.dataSource,
      schedule: report.schedule,
      delivery: report.delivery,
      parameters: Object.fromEntries(report.parameters),
      owner: report.owner,
      permissions: report.permissions,
      created_at: report.createdAt,
      updated_at: report.updatedAt,
      metadata: Object.fromEntries(report.metadata)
    });
    
    // If report has schedule, calculate next run time
    if (report.schedule && report.schedule.enabled) {
      report.schedule.nextRunTime = this.calculateReportNextRunTime(report.schedule);
      
      // Update in memory
      this.reports.set(reportId, report);
      
      // Update in database
      await this.db.reports.update(reportId, {
        schedule: report.schedule
      });
    }
    
    return reportId;
  }
  
  async generateReport(reportId: string, parameters?: Map<string, any>): Promise<string> {
    // Get report
    const report = await this.getReport(reportId);
    
    // Merge parameters
    const mergedParameters = new Map([...report.parameters, ...(parameters || new Map())]);
    
    // Generate report
    const reportContent = await this.reportGenerator.generate(report, mergedParameters);
    
    // If report has delivery, deliver report
    if (report.delivery && report.delivery.length > 0) {
      for (const delivery of report.delivery) {
        if (delivery.enabled) {
          await this.deliverReport(reportContent, delivery);
        }
      }
    }
    
    // If report has schedule, update last run time
    if (report.schedule && report.schedule.enabled) {
      report.schedule.lastRunTime = new Date();
      report.schedule.nextRunTime = this.calculateReportNextRunTime(report.schedule);
      
      // Update in memory
      this.reports.set(reportId, report);
      
      // Update in database
      await this.db.reports.update(reportId, {
        schedule: report.schedule
      });
    }
    
    return report
