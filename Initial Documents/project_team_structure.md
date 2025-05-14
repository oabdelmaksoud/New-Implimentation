# Project Team Structure and Hierarchy

## Overview

The Project Team Structure and Hierarchy component is a critical part of the Project-Specific Features phase. It defines how agents are organized within projects, their roles, responsibilities, and communication patterns. This document outlines the detailed implementation plan for the Project Team Structure and Hierarchy system.

## Objectives

- Implement preset team structures for projects
- Create hierarchical agent relationships
- Develop role-based communication patterns
- Implement task distribution based on agent roles

## Tasks

1. **Project Team Templates**
   - Implement standard team structures
   - Create role definitions
   - Develop team composition rules
   - Implement team template management

2. **Agent Hierarchy Implementation**
   - Create hierarchical relationships
   - Implement authority and delegation
   - Develop reporting structures
   - Create visualization of hierarchies

3. **Role-Based Communication**
   - Implement communication channels
   - Create communication protocols
   - Develop message routing
   - Implement communication monitoring

4. **Task Assignment and Distribution**
   - Create role-based task assignment
   - Implement workload balancing
   - Develop task delegation
   - Create task progress tracking

## Micro-Level Implementation Details

### Project Team Structure

```typescript
// Project Team Template
interface ProjectTeamTemplate {
  id: string;                     // Unique template ID
  name: string;                   // Template name
  description: string;            // Template description
  roles: ProjectRole[];           // Roles in the template
  hierarchyDefinition: HierarchyDefinition; // Hierarchy definition
  communicationChannels: CommunicationChannel[]; // Communication channels
  metadata: Map<string, any>;     // Additional metadata
}

// Project Role
interface ProjectRole {
  id: string;                     // Unique role ID
  name: string;                   // Role name
  description: string;            // Role description
  responsibilities: string[];     // Role responsibilities
  requiredCapabilities: string[]; // Required capabilities
  requiredSkills: Skill[];        // Required skills
  minAgents: number;              // Minimum agents for this role
  maxAgents: number;              // Maximum agents for this role
  metadata: Map<string, any>;     // Additional metadata
}

// Hierarchy Definition
interface HierarchyDefinition {
  rootRoleId: string;             // Root role ID (usually Manager)
  relationships: HierarchyRelationship[]; // Hierarchy relationships
}

// Hierarchy Relationship
interface HierarchyRelationship {
  parentRoleId: string;           // Parent role ID
  childRoleId: string;            // Child role ID
  relationshipType: RelationshipType; // Relationship type
}

// Relationship Type
enum RelationshipType {
  DIRECT_REPORT = 'direct_report',
  MATRIX = 'matrix',
  FUNCTIONAL = 'functional',
  DOTTED_LINE = 'dotted_line'
}

// Communication Channel
interface CommunicationChannel {
  id: string;                     // Unique channel ID
  name: string;                   // Channel name
  description: string;            // Channel description
  participantRoles: string[];     // Participant role IDs
  channelType: ChannelType;       // Channel type
  metadata: Map<string, any>;     // Additional metadata
}

// Channel Type
enum ChannelType {
  TEAM_WIDE = 'team_wide',
  ROLE_SPECIFIC = 'role_specific',
  CROSS_FUNCTIONAL = 'cross_functional',
  ONE_ON_ONE = 'one_on_one'
}

// Project Team
interface ProjectTeam {
  id: string;                     // Unique team ID
  projectId: string;              // Project ID
  templateId: string;             // Template ID
  name: string;                   // Team name
  description: string;            // Team description
  roleAssignments: RoleAssignment[]; // Role assignments
  communicationChannels: string[]; // Communication channel IDs
  metadata: Map<string, any>;     // Additional metadata
}

// Role Assignment
interface RoleAssignment {
  roleId: string;                 // Role ID
  agentIds: string[];             // Agent IDs assigned to this role
}

// Team Member
interface TeamMember {
  agentId: string;                // Agent ID
  projectId: string;              // Project ID
  teamId: string;                 // Team ID
  roleIds: string[];              // Role IDs
  joinDate: Date;                 // Join date
  status: MemberStatus;           // Member status
  metadata: Map<string, any>;     // Additional metadata
}

// Member Status
enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  PENDING = 'pending'
}
```

### Standard Team Templates

```typescript
// Standard team templates
const standardTeamTemplates: ProjectTeamTemplate[] = [
  {
    id: 'standard-development-team',
    name: 'Standard Development Team',
    description: 'Standard team structure for software development projects',
    roles: [
      {
        id: 'project-manager',
        name: 'Project Manager',
        description: 'Responsible for overall project management and coordination',
        responsibilities: [
          'Project planning and scheduling',
          'Resource allocation',
          'Risk management',
          'Stakeholder communication',
          'Progress tracking and reporting'
        ],
        requiredCapabilities: [
          'project_management',
          'leadership',
          'communication'
        ],
        requiredSkills: [
          {
            name: 'project_management',
            level: 4
          },
          {
            name: 'leadership',
            level: 3
          },
          {
            name: 'risk_management',
            level: 3
          }
        ],
        minAgents: 1,
        maxAgents: 1,
        metadata: new Map()
      },
      {
        id: 'technical-lead',
        name: 'Technical Lead',
        description: 'Responsible for technical direction and architecture',
        responsibilities: [
          'Technical architecture design',
          'Code quality standards',
          'Technical decision making',
          'Development team guidance',
          'Technical risk assessment'
        ],
        requiredCapabilities: [
          'technical_leadership',
          'architecture_design',
          'code_review'
        ],
        requiredSkills: [
          {
            name: 'software_architecture',
            level: 4
          },
          {
            name: 'technical_leadership',
            level: 3
          },
          {
            name: 'code_quality',
            level: 4
          }
        ],
        minAgents: 1,
        maxAgents: 1,
        metadata: new Map()
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'Responsible for implementing software features',
        responsibilities: [
          'Feature implementation',
          'Code maintenance',
          'Unit testing',
          'Bug fixing',
          'Documentation'
        ],
        requiredCapabilities: [
          'software_development',
          'problem_solving',
          'testing'
        ],
        requiredSkills: [
          {
            name: 'software_development',
            level: 3
          },
          {
            name: 'problem_solving',
            level: 3
          },
          {
            name: 'unit_testing',
            level: 2
          }
        ],
        minAgents: 2,
        maxAgents: 10,
        metadata: new Map()
      },
      {
        id: 'qa-engineer',
        name: 'QA Engineer',
        description: 'Responsible for quality assurance and testing',
        responsibilities: [
          'Test planning',
          'Test case development',
          'Test execution',
          'Defect reporting',
          'Quality metrics tracking'
        ],
        requiredCapabilities: [
          'quality_assurance',
          'testing',
          'defect_management'
        ],
        requiredSkills: [
          {
            name: 'software_testing',
            level: 3
          },
          {
            name: 'test_automation',
            level: 2
          },
          {
            name: 'defect_management',
            level: 3
          }
        ],
        minAgents: 1,
        maxAgents: 5,
        metadata: new Map()
      },
      {
        id: 'aspice-assessor',
        name: 'ASPICE Assessor',
        description: 'Responsible for ASPICE compliance and assessment',
        responsibilities: [
          'ASPICE compliance verification',
          'Process assessment',
          'Documentation review',
          'Compliance reporting',
          'Improvement recommendations'
        ],
        requiredCapabilities: [
          'aspice_assessment',
          'process_improvement',
          'compliance'
        ],
        requiredSkills: [
          {
            name: 'aspice',
            level: 4
          },
          {
            name: 'process_assessment',
            level: 3
          },
          {
            name: 'compliance_management',
            level: 3
          }
        ],
        minAgents: 1,
        maxAgents: 2,
        metadata: new Map()
      }
    ],
    hierarchyDefinition: {
      rootRoleId: 'project-manager',
      relationships: [
        {
          parentRoleId: 'project-manager',
          childRoleId: 'technical-lead',
          relationshipType: RelationshipType.DIRECT_REPORT
        },
        {
          parentRoleId: 'project-manager',
          childRoleId: 'qa-engineer',
          relationshipType: RelationshipType.DIRECT_REPORT
        },
        {
          parentRoleId: 'project-manager',
          childRoleId: 'aspice-assessor',
          relationshipType: RelationshipType.DIRECT_REPORT
        },
        {
          parentRoleId: 'technical-lead',
          childRoleId: 'developer',
          relationshipType: RelationshipType.DIRECT_REPORT
        },
        {
          parentRoleId: 'qa-engineer',
          childRoleId: 'developer',
          relationshipType: RelationshipType.FUNCTIONAL
        }
      ]
    },
    communicationChannels: [
      {
        id: 'team-wide',
        name: 'Team-Wide Channel',
        description: 'Channel for team-wide communication',
        participantRoles: [
          'project-manager',
          'technical-lead',
          'developer',
          'qa-engineer',
          'aspice-assessor'
        ],
        channelType: ChannelType.TEAM_WIDE,
        metadata: new Map()
      },
      {
        id: 'development-channel',
        name: 'Development Channel',
        description: 'Channel for development team communication',
        participantRoles: [
          'technical-lead',
          'developer'
        ],
        channelType: ChannelType.ROLE_SPECIFIC,
        metadata: new Map()
      },
      {
        id: 'qa-channel',
        name: 'QA Channel',
        description: 'Channel for QA team communication',
        participantRoles: [
          'qa-engineer',
          'developer'
        ],
        channelType: ChannelType.ROLE_SPECIFIC,
        metadata: new Map()
      },
      {
        id: 'compliance-channel',
        name: 'Compliance Channel',
        description: 'Channel for compliance communication',
        participantRoles: [
          'project-manager',
          'aspice-assessor',
          'technical-lead'
        ],
        channelType: ChannelType.CROSS_FUNCTIONAL,
        metadata: new Map()
      },
      {
        id: 'pm-tech-lead',
        name: 'PM-Tech Lead Channel',
        description: 'One-on-one channel between Project Manager and Technical Lead',
        participantRoles: [
          'project-manager',
          'technical-lead'
        ],
        channelType: ChannelType.ONE_ON_ONE,
        metadata: new Map()
      }
    ],
    metadata: new Map()
  }
];
```

### Team Management System

```typescript
// Team Management System
class TeamManagementSystem {
  private db: Database;
  private templates: Map<string, ProjectTeamTemplate>;
  private teams: Map<string, ProjectTeam>;
  private teamMembers: Map<string, TeamMember[]>;
  
  constructor(db: Database) {
    this.db = db;
    this.templates = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
  }
  
  async initialize(): Promise<void> {
    // Load templates from database
    const templateData = await this.db.projectTeamTemplates.findAll();
    for (const data of templateData) {
      const template: ProjectTeamTemplate = {
        id: data.uuid,
        name: data.name,
        description: data.description,
        roles: data.roles,
        hierarchyDefinition: data.hierarchy_definition,
        communicationChannels: data.communication_channels,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.templates.set(template.id, template);
    }
    
    // Load teams from database
    const teamData = await this.db.projectTeams.findAll();
    for (const data of teamData) {
      const team: ProjectTeam = {
        id: data.uuid,
        projectId: data.project_id,
        templateId: data.template_id,
        name: data.name,
        description: data.description,
        roleAssignments: data.role_assignments,
        communicationChannels: data.communication_channels,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.teams.set(team.id, team);
    }
    
    // Load team members from database
    const memberData = await this.db.teamMembers.findAll();
    for (const data of memberData) {
      const member: TeamMember = {
        agentId: data.agent_id,
        projectId: data.project_id,
        teamId: data.team_id,
        roleIds: data.role_ids,
        joinDate: data.join_date,
        status: data.status as MemberStatus,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      if (!this.teamMembers.has(member.teamId)) {
        this.teamMembers.set(member.teamId, []);
      }
      
      this.teamMembers.get(member.teamId).push(member);
    }
    
    // Initialize standard templates if none exist
    if (this.templates.size === 0) {
      for (const template of standardTeamTemplates) {
        await this.createTeamTemplate(template);
      }
    }
  }
  
  async createTeamTemplate(templateData: Omit<ProjectTeamTemplate, 'id'>): Promise<string> {
    // Generate template ID
    const templateId = uuidv4();
    
    // Create template object
    const template: ProjectTeamTemplate = {
      id: templateId,
      ...templateData
    };
    
    // Validate template
    this.validateTeamTemplate(template);
    
    // Add to memory
    this.templates.set(templateId, template);
    
    // Store in database
    await this.db.projectTeamTemplates.create({
      uuid: templateId,
      name: template.name,
      description: template.description,
      roles: template.roles,
      hierarchy_definition: template.hierarchyDefinition,
      communication_channels: template.communicationChannels,
      metadata: Object.fromEntries(template.metadata)
    });
    
    return templateId;
  }
  
  async createTeam(teamData: Omit<ProjectTeam, 'id'>): Promise<string> {
    // Check if template exists
    if (!this.templates.has(teamData.templateId)) {
      throw new Error(`Team template ${teamData.templateId} not found`);
    }
    
    // Generate team ID
    const teamId = uuidv4();
    
    // Create team object
    const team: ProjectTeam = {
      id: teamId,
      ...teamData
    };
    
    // Validate team
    this.validateTeam(team);
    
    // Add to memory
    this.teams.set(teamId, team);
    
    // Store in database
    await this.db.projectTeams.create({
      uuid: teamId,
      project_id: team.projectId,
      template_id: team.templateId,
      name: team.name,
      description: team.description,
      role_assignments: team.roleAssignments,
      communication_channels: team.communicationChannels,
      metadata: Object.fromEntries(team.metadata)
    });
    
    return teamId;
  }
  
  async addTeamMember(memberData: Omit<TeamMember, 'joinDate' | 'status'>): Promise<void> {
    // Check if team exists
    if (!this.teams.has(memberData.teamId)) {
      throw new Error(`Team ${memberData.teamId} not found`);
    }
    
    // Create member object
    const member: TeamMember = {
      ...memberData,
      joinDate: new Date(),
      status: MemberStatus.ACTIVE
    };
    
    // Validate member
    this.validateTeamMember(member);
    
    // Add to memory
    if (!this.teamMembers.has(member.teamId)) {
      this.teamMembers.set(member.teamId, []);
    }
    
    this.teamMembers.get(member.teamId).push(member);
    
    // Store in database
    await this.db.teamMembers.create({
      agent_id: member.agentId,
      project_id: member.projectId,
      team_id: member.teamId,
      role_ids: member.roleIds,
      join_date: member.joinDate,
      status: member.status,
      metadata: Object.fromEntries(member.metadata)
    });
  }
  
  async getTeamHierarchy(teamId: string): Promise<HierarchyNode> {
    // Get team
    const team = await this.getTeam(teamId);
    
    // Get template
    const template = await this.getTeamTemplate(team.templateId);
    
    // Get team members
    const members = await this.getTeamMembers(teamId);
    
    // Build hierarchy
    return this.buildHierarchy(team, template, members);
  }
  
  private buildHierarchy(
    team: ProjectTeam,
    template: ProjectTeamTemplate,
    members: TeamMember[]
  ): HierarchyNode {
    // Find root role
    const rootRoleId = template.hierarchyDefinition.rootRoleId;
    
    // Find agents assigned to root role
    const rootRoleAssignment = team.roleAssignments.find(ra => ra.roleId === rootRoleId);
    if (!rootRoleAssignment) {
      throw new Error(`No agents assigned to root role ${rootRoleId}`);
    }
    
    // Find root role definition
    const rootRole = template.roles.find(r => r.id === rootRoleId);
    if (!rootRole) {
      throw new Error(`Root role ${rootRoleId} not found in template`);
    }
    
    // Create root node
    const rootNode: HierarchyNode = {
      roleId: rootRoleId,
      roleName: rootRole.name,
      agentIds: rootRoleAssignment.agentIds,
      children: []
    };
    
    // Build child nodes
    this.buildChildNodes(
      rootNode,
      template.hierarchyDefinition.relationships,
      team.roleAssignments,
      template.roles
    );
    
    return rootNode;
  }
  
  private buildChildNodes(
    parentNode: HierarchyNode,
    relationships: HierarchyRelationship[],
    roleAssignments: RoleAssignment[],
    roles: ProjectRole[]
  ): void {
    // Find direct child relationships
    const childRelationships = relationships.filter(r => 
      r.parentRoleId === parentNode.roleId && 
      r.relationshipType === RelationshipType.DIRECT_REPORT
    );
    
    // Create child nodes
    for (const relationship of childRelationships) {
      // Find role assignment
      const roleAssignment = roleAssignments.find(ra => ra.roleId === relationship.childRoleId);
      if (!roleAssignment) {
        continue; // Skip if no agents assigned to this role
      }
      
      // Find role definition
      const role = roles.find(r => r.id === relationship.childRoleId);
      if (!role) {
        continue; // Skip if role not found
      }
      
      // Create child node
      const childNode: HierarchyNode = {
        roleId: relationship.childRoleId,
        roleName: role.name,
        agentIds: roleAssignment.agentIds,
        children: []
      };
      
      // Add to parent's children
      parentNode.children.push(childNode);
      
      // Recursively build child nodes
      this.buildChildNodes(childNode, relationships, roleAssignments, roles);
    }
    
    // Find functional relationships
    const functionalRelationships = relationships.filter(r => 
      r.parentRoleId === parentNode.roleId && 
      r.relationshipType === RelationshipType.FUNCTIONAL
    );
    
    // Create functional child nodes
    for (const relationship of functionalRelationships) {
      // Find role assignment
      const roleAssignment = roleAssignments.find(ra => ra.roleId === relationship.childRoleId);
      if (!roleAssignment) {
        continue; // Skip if no agents assigned to this role
      }
      
      // Find role definition
      const role = roles.find(r => r.id === relationship.childRoleId);
      if (!role) {
        continue; // Skip if role not found
      }
      
      // Check if child node already exists (from direct report)
      const existingChild = parentNode.children.find(c => c.roleId === relationship.childRoleId);
      if (existingChild) {
        continue; // Skip if already added
      }
      
      // Create child node
      const childNode: HierarchyNode = {
        roleId: relationship.childRoleId,
        roleName: role.name,
        agentIds: roleAssignment.agentIds,
        children: [],
        relationshipType: RelationshipType.FUNCTIONAL
      };
      
      // Add to parent's children
      parentNode.children.push(childNode);
    }
  }
  
  async getTeamCommunicationChannels(teamId: string): Promise<CommunicationChannelInfo[]> {
    // Get team
    const team = await this.getTeam(teamId);
    
    // Get template
    const template = await this.getTeamTemplate(team.templateId);
    
    // Get team members
    const members = await this.getTeamMembers(teamId);
    
    // Build communication channels
    const channels: CommunicationChannelInfo[] = [];
    
    for (const channelId of team.communicationChannels) {
      // Find channel definition
      const channelDef = template.communicationChannels.find(c => c.id === channelId);
      if (!channelDef) {
        continue; // Skip if channel not found
      }
      
      // Find participating agents
      const participatingAgents: string[] = [];
      
      for (const member of members) {
        // Check if member has any of the participating roles
        const hasParticipatingRole = member.roleIds.some(roleId => 
          channelDef.participantRoles.includes(roleId)
        );
        
        if (hasParticipatingRole) {
          participatingAgents.push(member.agentId);
        }
      }
      
      // Create channel info
      const channelInfo: CommunicationChannelInfo = {
        id: channelDef.id,
        name: channelDef.name,
        description: channelDef.description,
        participantRoles: channelDef.participantRoles,
        participantAgents: participatingAgents,
        channelType: channelDef.channelType
      };
      
      channels.push(channelInfo);
    }
    
    return channels;
  }
  
  // Helper methods
  private validateTeamTemplate(template: ProjectTeamTemplate): void {
    // Check if template has at least one role
    if (!template.roles || template.roles.length === 0) {
      throw new Error('Team template must have at least one role');
    }
    
    // Check if hierarchy definition is valid
    if (!template.hierarchyDefinition || !template.hierarchyDefinition.rootRoleId) {
      throw new Error('Team template must have a valid hierarchy definition with a root role');
    }
    
    // Check if root role exists
    const rootRole = template.roles.find(r => r.id === template.hierarchyDefinition.rootRoleId);
    if (!rootRole) {
      throw new Error(`Root role ${template.hierarchyDefinition.rootRoleId} not found in template roles`);
    }
    
    // Check if all relationship roles exist
    for (const relationship of template.hierarchyDefinition.relationships) {
      const parentRole = template.roles.find(r => r.id === relationship.parentRoleId);
      if (!parentRole) {
        throw new Error(`Parent role ${relationship.parentRoleId} not found in template roles`);
      }
      
      const childRole = template.roles.find(r => r.id === relationship.childRoleId);
      if (!childRole) {
        throw new Error(`Child role ${relationship.childRoleId} not found in template roles`);
      }
    }
    
    // Check if all communication channel participant roles exist
    for (const channel of template.communicationChannels) {
      for (const roleId of channel.participantRoles) {
        const role = template.roles.find(r => r.id === roleId);
        if (!role) {
          throw new Error(`Participant role ${roleId} not found in template roles`);
        }
      }
    }
  }
  
  private validateTeam(team: ProjectTeam): void {
    // Check if template exists
    if (!this.templates.has(team.templateId)) {
      throw new Error(`Team template ${team.templateId} not found`);
    }
    
    const template = this.templates.get(team.templateId);
    
    // Check if all required roles have assignments
    for (const role of template.roles) {
      if (role.minAgents > 0) {
        const assignment = team.roleAssignments.find(ra => ra.roleId === role.id);
        if (!assignment) {
          throw new Error(`Required role ${role.id} has no assignment`);
        }
        
        if (assignment.agentIds.length < role.minAgents) {
          throw new Error(`Role ${role.id} requires at least ${role.minAgents} agents, but only ${assignment.agentIds.length} assigned`);
        }
        
        if (role.maxAgents > 0 && assignment.agentIds.length > role.maxAgents) {
          throw new Error(`Role ${role.id} allows at most ${role.maxAgents} agents, but ${assignment.agentIds.length} assigned`);
        }
      }
    }
    
    // Check if all role assignments are valid
    for (const assignment of team.roleAssignments) {
      const role = template.roles.find(r => r.id === assignment.roleId);
      if (!role) {
        throw new Error(`Role ${assignment.roleId} not found in template roles`);
      }
    }
    
    // Check if all communication channels are valid
    for (const channelId of team.communicationChannels) {
      const channel = template.communicationChannels.find(c => c.id === channelId);
      if (!channel) {
        throw new Error(`Communication channel ${channelId} not found in template`);
      }
    }
  }
  
  private validateTeamMember(member: TeamMember): void {
    // Check if team exists
    if (!this.teams.has(member.teamId)) {
      throw new Error(`Team ${member.teamId} not found`);
    }
    
    const team = this.teams.get(member.teamId);
    
    // Check if project ID matches team's project ID
    if (member.projectId !== team.projectId) {
      throw new Error(`Member project ID ${member.projectId} does not match team's project ID ${team.projectId}`);
    }
    
    // Check if all roles are valid
    const template = this.templates.get(team.templateId);
    for (const roleId of member.roleIds) {
      const role = template.roles.find(r => r.id === roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found in template roles`);
      }
      
      // Check if role has available slots
      const assignment = team.roleAssignments.find(ra => ra.roleId === roleId);
      if (assignment) {
        if (role.maxAgents > 0 && assignment.agentIds.length >= role.maxAgents) {
          throw new Error(`Role ${roleId} already has maximum number of agents (${role.maxAgents})`);
        }
      }
    }
  }
  
  async getTeam(teamId: string): Promise<ProjectTeam> {
    // Check in memory
    if (this.teams.has(teamId)) {
      return this.teams.get(teamId);
    }
    
    // Get from database
    const teamData = await this.db.projectTeams.findByUuid(teamId);
    if (!teamData) {
      throw new Error(`Team ${teamId} not found`);
    }
    
    // Convert to ProjectTeam object
    const team: ProjectTeam = {
      id: teamData.uuid,
      projectId: teamData.project_id,
      templateId: teamData.template_id,
      name: teamData.name,
      description: teamData.description,
      roleAssignments: teamData.role_assignments,
      communicationChannels: teamData.communication_channels,
      metadata: new Map(Object.entries(teamData.metadata || {}))
    };
    
    // Add to memory
    this.teams.set(teamId, team);
    
    return team;
  }
  
  async getTeamTemplate(templateId: string): Promise<ProjectTeamTemplate> {
    // Check in memory
    if (this.templates.has(templateId)) {
      return this.templates.get(templateId);
    }
    
    // Get from database
    const templateData = await this.db.projectTeamTemplates.findByUuid(templateId);
    if (!templateData) {
      throw new Error(`Team template ${templateId} not found`);
    }
    
    // Convert to ProjectTeamTemplate object
    const template: ProjectTeamTemplate = {
      id: templateData.uuid,
      name: templateData.name,
      description: templateData.description,
      roles: templateData.roles,
      hierarchyDefinition: templateData.hierarchy_definition,
      communicationChannels: templateData.communication_channels,
      metadata:
