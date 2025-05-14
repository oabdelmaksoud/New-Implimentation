# Agent Collaboration Mechanisms

## Overview

The Agent Collaboration Mechanisms component is a critical part of the Agent Capabilities and Communication phase. It enables agents to work together effectively, form teams, make collective decisions, and coordinate their activities. This document outlines the detailed implementation plan for the Agent Collaboration Mechanisms.

## Objectives

- Implement collaboration between agents
- Create team structures and roles
- Develop consensus and decision-making mechanisms

## Tasks

1. **Team Formation and Management**
   - Implement team definitions and structures
   - Create team role assignments
   - Develop team communication channels
   - Implement team performance metrics

2. **Collaborative Problem Solving**
   - Create problem decomposition mechanisms
   - Implement solution aggregation
   - Develop conflict resolution
   - Create consensus building protocols

3. **Shared Resources and Knowledge**
   - Implement shared workspace for teams
   - Create shared knowledge repositories
   - Develop access control for shared resources
   - Implement versioning for shared artifacts

4. **Coordination Mechanisms**
   - Create coordination protocols
   - Implement synchronization points
   - Develop progress tracking across agents
   - Create coordination visualization

## Micro-Level Implementation Details

### Team Structure

```typescript
// Team Structure
interface Team {
  id: string;                     // Unique team ID
  name: string;                   // Human-readable name
  description: string;            // Team description
  purpose: string;                // Team purpose/mission
  members: string[];              // List of agent IDs
  roles: Map<string, string>;     // Role name to agent ID mapping
  leader?: string;                // Leader agent ID (optional)
  createdAt: Date;                // Creation timestamp
  status: TeamStatus;             // Current status
  metadata: Map<string, any>;     // Additional metadata
}

// Team Status
enum TeamStatus {
  FORMING = 'forming',
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISBANDED = 'disbanded'
}

// Team Role
interface Role {
  name: string;                   // Role name
  description: string;            // Role description
  responsibilities: string[];     // List of responsibilities
  requiredCapabilities: string[]; // Required agent capabilities
  requiredSkills: Skill[];        // Required skills with minimum levels
  permissions: string[];          // Permissions granted to this role
  metadata: Map<string, any>;     // Additional metadata
  required: boolean;              // Whether this role is required
}

// Skill with level
interface Skill {
  name: string;                   // Skill name
  level: number;                  // Skill level (1-5)
  description?: string;           // Optional description
}

// Team Requirements for formation
interface TeamRequirements {
  name?: string;                  // Team name
  purpose: string;                // Team purpose
  roles: Role[];                  // Required roles
  requiredSkills: Skill[];        // Skills needed across the team
  constraints?: TeamConstraint[]; // Additional constraints
}

// Team Constraint
interface TeamConstraint {
  type: ConstraintType;
  parameters: any;
}

enum ConstraintType {
  AGENT_INCLUSION,      // Specific agents must be included
  AGENT_EXCLUSION,      // Specific agents must be excluded
  MINIMUM_SKILL_LEVEL,  // Team must have minimum skill level
  MAXIMUM_SIZE,         // Team must not exceed size
  MINIMUM_SIZE          // Team must have at least this many members
}
```

### Team Formation Engine

```typescript
// Team Formation Engine
class TeamFormationEngine {
  private agents: Map<string, BaseAgent>;
  private skillMatrix: SkillMatrix;
  private teamTemplates: Map<string, TeamTemplate>;
  
  constructor(
    private agentManager: AgentLifecycleManager,
    private db: Database
  ) {
    this.agents = new Map();
    this.skillMatrix = new SkillMatrix(db);
    this.teamTemplates = new Map();
  }
  
  async initialize(): Promise<void> {
    // Load all agents
    const agentData = await this.db.agents.findAll();
    for (const data of agentData) {
      const agent = await this.agentManager.getAgent(data.uuid);
      this.agents.set(data.uuid, agent);
    }
    
    // Load team templates
    const templates = await this.db.teamTemplates.findAll();
    for (const template of templates) {
      this.teamTemplates.set(template.id, {
        id: template.id,
        name: template.name,
        description: template.description,
        roles: template.roles,
        purpose: template.purpose
      });
    }
    
    // Initialize skill matrix
    await this.skillMatrix.initialize();
  }
  
  async formTeam(
    requirements: TeamRequirements,
    availableAgents: string[] = null
  ): Promise<Team> {
    // Filter available agents if specified
    const candidateAgents = availableAgents
      ? Array.from(this.agents.entries())
          .filter(([id]) => availableAgents.includes(id))
          .map(([, agent]) => agent)
      : Array.from(this.agents.values());
    
    // Calculate skill coverage for each agent
    const skillCoverage = new Map<string, number>();
    for (const agent of candidateAgents) {
      const coverage = await this.calculateSkillCoverage(agent, requirements.requiredSkills);
      skillCoverage.set(agent.id, coverage);
    }
    
    // Sort agents by skill coverage (descending)
    const sortedAgents = candidateAgents.sort((a, b) => {
      return skillCoverage.get(b.id) - skillCoverage.get(a.id);
    });
    
    // Initialize team
    const team: Team = {
      id: `team-${Date.now()}`,
      name: requirements.name || `Team for ${requirements.purpose}`,
      description: `Team formed for: ${requirements.purpose}`,
      purpose: requirements.purpose,
      members: [],
      roles: new Map(),
      createdAt: new Date(),
      status: TeamStatus.FORMING,
      metadata: new Map()
    };
    
    // Assign roles based on requirements
    for (const role of requirements.roles) {
      // Find best agent for this role
      const bestAgent = await this.findBestAgentForRole(
        sortedAgents.filter(a => !team.members.includes(a.id)),
        role
      );
      
      if (bestAgent) {
        team.members.push(bestAgent.id);
        team.roles.set(role.name, bestAgent.id);
      } else {
        // No suitable agent found for this role
        console.warn(`No suitable agent found for role: ${role.name}`);
      }
    }
    
    // Check if all required roles are filled
    const missingRoles = requirements.roles
      .filter(r => r.required && !team.roles.has(r.name))
      .map(r => r.name);
    
    if (missingRoles.length > 0) {
      throw new Error(`Could not form team: missing required roles: ${missingRoles.join(', ')}`);
    }
    
    // Apply constraints
    if (requirements.constraints) {
      for (const constraint of requirements.constraints) {
        await this.applyConstraint(team, constraint, candidateAgents);
      }
    }
    
    // Select leader if not already assigned
    if (!team.leader && team.members.length > 0) {
      // Find coordinator agents in the team
      const coordinators = team.members.filter(id => {
        const agent = this.agents.get(id);
        return agent.role === 'COORDINATOR';
      });
      
      if (coordinators.length > 0) {
        // Select the first coordinator as leader
        team.leader = coordinators[0];
      } else {
        // Select the first member as leader
        team.leader = team.members[0];
      }
    }
    
    // Team successfully formed
    team.status = TeamStatus.ACTIVE;
    
    // Store team in database
    await this.db.teams.create({
      uuid: team.id,
      name: team.name,
      description: team.description,
      purpose: team.purpose,
      members: team.members,
      roles: Object.fromEntries(team.roles),
      leader: team.leader,
      status: team.status,
      created_at: team.createdAt,
      metadata: Object.fromEntries(team.metadata)
    });
    
    return team;
  }
  
  async formTeamFromTemplate(
    templateId: string,
    customizations: Partial<TeamRequirements> = {}
  ): Promise<Team> {
    // Get template
    const template = this.teamTemplates.get(templateId);
    if (!template) {
      throw new Error(`Team template ${templateId} not found`);
    }
    
    // Create requirements from template with customizations
    const requirements: TeamRequirements = {
      name: customizations.name || template.name,
      purpose: customizations.purpose || template.purpose,
      roles: customizations.roles || template.roles,
      requiredSkills: customizations.requiredSkills || this.extractSkillsFromRoles(template.roles),
      constraints: customizations.constraints
    };
    
    // Form team
    return this.formTeam(requirements);
  }
  
  async disbandTeam(teamId: string): Promise<void> {
    // Get team
    const team = await this.db.teams.findByUuid(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }
    
    // Update status
    await this.db.teams.update(teamId, {
      status: TeamStatus.DISBANDED
    });
    
    // Notify members
    for (const memberId of team.members) {
      const agent = await this.agentManager.getAgent(memberId);
      await agent.processMessage({
        id: uuidv4(),
        sender: { id: 'system', name: 'System' },
        recipients: [{ id: memberId, name: '' }],
        timestamp: new Date(),
        priority: 'MEDIUM',
        content: {
          type: 'TEXT',
          text: `Team ${team.name} (${teamId}) has been disbanded.`
        },
        requiresAcknowledgment: false
      });
    }
  }
  
  async addMemberToTeam(teamId: string, agentId: string, role?: string): Promise<void> {
    // Get team
    const teamData = await this.db.teams.findByUuid(teamId);
    if (!teamData) {
      throw new Error(`Team ${teamId} not found`);
    }
    
    // Check if agent exists
    const agent = await this.agentManager.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Check if agent is already a member
    if (teamData.members.includes(agentId)) {
      throw new Error(`Agent ${agentId} is already a member of team ${teamId}`);
    }
    
    // Add member
    const updatedMembers = [...teamData.members, agentId];
    
    // Update roles if specified
    let updatedRoles = { ...teamData.roles };
    if (role) {
      updatedRoles[role] = agentId;
    }
    
    // Update team
    await this.db.teams.update(teamId, {
      members: updatedMembers,
      roles: updatedRoles
    });
    
    // Notify new member
    await agent.processMessage({
      id: uuidv4(),
      sender: { id: 'system', name: 'System' },
      recipients: [{ id: agentId, name: '' }],
      timestamp: new Date(),
      priority: 'MEDIUM',
      content: {
        type: 'TEXT',
        text: `You have been added to team ${teamData.name} (${teamId})${role ? ` with role ${role}` : ''}.`
      },
      requiresAcknowledgment: false
    });
    
    // Notify team members
    for (const memberId of teamData.members) {
      if (memberId !== agentId) {
        const memberAgent = await this.agentManager.getAgent(memberId);
        await memberAgent.processMessage({
          id: uuidv4(),
          sender: { id: 'system', name: 'System' },
          recipients: [{ id: memberId, name: '' }],
          timestamp: new Date(),
          priority: 'LOW',
          content: {
            type: 'TEXT',
            text: `Agent ${agent.name} (${agentId}) has joined team ${teamData.name} (${teamId})${role ? ` with role ${role}` : ''}.`
          },
          requiresAcknowledgment: false
        });
      }
    }
  }
  
  async removeMemberFromTeam(teamId: string, agentId: string): Promise<void> {
    // Get team
    const teamData = await this.db.teams.findByUuid(teamId);
    if (!teamData) {
      throw new Error(`Team ${teamId} not found`);
    }
    
    // Check if agent is a member
    if (!teamData.members.includes(agentId)) {
      throw new Error(`Agent ${agentId} is not a member of team ${teamId}`);
    }
    
    // Remove member
    const updatedMembers = teamData.members.filter(id => id !== agentId);
    
    // Remove from roles
    const updatedRoles = { ...teamData.roles };
    for (const [role, id] of Object.entries(updatedRoles)) {
      if (id === agentId) {
        delete updatedRoles[role];
      }
    }
    
    // Check if leader is being removed
    let updatedLeader = teamData.leader;
    if (teamData.leader === agentId) {
      // Select new leader if there are remaining members
      if (updatedMembers.length > 0) {
        updatedLeader = updatedMembers[0];
      } else {
        updatedLeader = null;
      }
    }
    
    // Update team
    await this.db.teams.update(teamId, {
      members: updatedMembers,
      roles: updatedRoles,
      leader: updatedLeader
    });
    
    // Notify removed member
    const agent = await this.agentManager.getAgent(agentId);
    await agent.processMessage({
      id: uuidv4(),
      sender: { id: 'system', name: 'System' },
      recipients: [{ id: agentId, name: '' }],
      timestamp: new Date(),
      priority: 'MEDIUM',
      content: {
        type: 'TEXT',
        text: `You have been removed from team ${teamData.name} (${teamId}).`
      },
      requiresAcknowledgment: false
    });
    
    // Notify remaining team members
    for (const memberId of updatedMembers) {
      const memberAgent = await this.agentManager.getAgent(memberId);
      await memberAgent.processMessage({
        id: uuidv4(),
        sender: { id: 'system', name: 'System' },
        recipients: [{ id: memberId, name: '' }],
        timestamp: new Date(),
        priority: 'LOW',
        content: {
          type: 'TEXT',
          text: `Agent ${agent.name} (${agentId}) has left team ${teamData.name} (${teamId}).`
        },
        requiresAcknowledgment: false
      });
    }
  }
  
  async getTeam(teamId: string): Promise<Team> {
    // Get from database
    const teamData = await this.db.teams.findByUuid(teamId);
    if (!teamData) {
      throw new Error(`Team ${teamId} not found`);
    }
    
    // Convert to Team object
    return {
      id: teamData.uuid,
      name: teamData.name,
      description: teamData.description,
      purpose: teamData.purpose,
      members: teamData.members,
      roles: new Map(Object.entries(teamData.roles)),
      leader: teamData.leader,
      createdAt: teamData.created_at,
      status: teamData.status as TeamStatus,
      metadata: new Map(Object.entries(teamData.metadata || {}))
    };
  }
  
  async getTeamsForAgent(agentId: string): Promise<Team[]> {
    // Get from database
    const teamData = await this.db.teams.findByMember(agentId);
    
    // Convert to Team objects
    return teamData.map(data => ({
      id: data.uuid,
      name: data.name,
      description: data.description,
      purpose: data.purpose,
      members: data.members,
      roles: new Map(Object.entries(data.roles)),
      leader: data.leader,
      createdAt: data.created_at,
      status: data.status as TeamStatus,
      metadata: new Map(Object.entries(data.metadata || {}))
    }));
  }
  
  private async calculateSkillCoverage(
    agent: BaseAgent,
    requiredSkills: Skill[]
  ): Promise<number> {
    let coverage = 0;
    const agentSkills = await this.skillMatrix.getAgentSkills(agent.id);
    
    for (const requiredSkill of requiredSkills) {
      const agentSkill = agentSkills.find(s => s.name === requiredSkill.name);
      if (agentSkill && agentSkill.level >= requiredSkill.level) {
        coverage += 1;
      }
    }
    
    return coverage / requiredSkills.length;
  }
  
  private async findBestAgentForRole(
    candidates: BaseAgent[],
    role: Role
  ): Promise<BaseAgent | null> {
    // Filter agents that meet minimum requirements
    const qualifiedCandidates = await Promise.all(candidates.map(async agent => {
      // Check if agent has required capabilities
      for (const capability of role.requiredCapabilities) {
        if (!agent.capabilities.has(capability)) {
          return null;
        }
      }
      
      // Check if agent has required skills at minimum level
      const agentSkills = await this.skillMatrix.getAgentSkills(agent.id);
      for (const skill of role.requiredSkills) {
        const agentSkill = agentSkills.find(s => s.name === skill.name);
        if (!agentSkill || agentSkill.level < skill.level) {
          return null;
        }
      }
      
      return agent;
    }));
    
    // Filter out null values
    const filteredCandidates = qualifiedCandidates.filter(Boolean);
    
    if (filteredCandidates.length === 0) {
      return null;
    }
    
    // Score candidates based on skill levels and experience
    const scores = new Map<string, number>();
    for (const agent of filteredCandidates) {
      let score = 0;
      const agentSkills = await this.skillMatrix.getAgentSkills(agent.id);
      
      // Score based on skill levels (higher is better)
      for (const skill of role.requiredSkills) {
        const agentSkill = agentSkills.find(s => s.name === skill.name);
        if (agentSkill) {
          // Bonus points for exceeding minimum level
          score += (agentSkill.level - skill.level) * 10;
        }
      }
      
      // Score based on experience with this role
      const roleExperience = await this.skillMatrix.getAgentRoleExperience(agent.id, role.name);
      score += roleExperience * 5;
      
      scores.set(agent.id, score);
    }
    
    // Return agent with highest score
    return filteredCandidates.sort((a, b) => {
      return scores.get(b.id) - scores.get(a.id);
    })[0];
  }
  
  private async applyConstraint(
    team: Team,
    constraint: TeamConstraint,
    candidateAgents: BaseAgent[]
  ): Promise<void> {
    switch (constraint.type) {
      case ConstraintType.AGENT_INCLUSION:
        // Ensure specific agents are included
        for (const agentId of constraint.parameters.agentIds) {
          if (!team.members.includes(agentId)) {
            // Add agent if not already in team
            const agent = this.agents.get(agentId);
            if (agent) {
              team.members.push(agentId);
            }
          }
        }
        break;
      
      case ConstraintType.AGENT_EXCLUSION:
        // Ensure specific agents are excluded
        team.members = team.members.filter(id => !constraint.parameters.agentIds.includes(id));
        // Also remove from roles
        for (const [role, agentId] of team.roles.entries()) {
          if (constraint.parameters.agentIds.includes(agentId)) {
            team.roles.delete(role);
          }
        }
        break;
      
      case ConstraintType.MINIMUM_SKILL_LEVEL:
        // Ensure team has minimum skill level
        const skillName = constraint.parameters.skill;
        const minLevel = constraint.parameters.level;
        
        // Calculate current team skill level
        let maxSkillLevel = 0;
        for (const agentId of team.members) {
          const agent = this.agents.get(agentId);
          const agentSkills = await this.skillMatrix.getAgentSkills(agent.id);
          const skill = agentSkills.find(s => s.name === skillName);
          if (skill && skill.level > maxSkillLevel) {
            maxSkillLevel = skill.level;
          }
        }
        
        // If below minimum, add agent with highest skill level
        if (maxSkillLevel < minLevel) {
          // Find agent with highest skill level
          let bestAgent = null;
          let bestLevel = 0;
          
          for (const agent of candidateAgents) {
            if (team.members.includes(agent.id)) {
              continue; // Skip agents already in team
            }
            
            const agentSkills = await this.skillMatrix.getAgentSkills(agent.id);
            const skill = agentSkills.find(s => s.name === skillName);
            if (skill && skill.level > bestLevel) {
              bestAgent = agent;
              bestLevel = skill.level;
            }
          }
          
          // Add best agent if found and meets minimum level
          if (bestAgent && bestLevel >= minLevel) {
            team.members.push(bestAgent.id);
          }
        }
        break;
      
      case ConstraintType.MAXIMUM_SIZE:
        // Ensure team does not exceed maximum size
        const maxSize = constraint.parameters.size;
        if (team.members.length > maxSize) {
          // Remove lowest priority members
          // For now, just remove from the end
          team.members = team.members.slice(0, maxSize);
        }
        break;
      
      case ConstraintType.MINIMUM_SIZE:
        // Ensure team has at least minimum size
        const minSize = constraint.parameters.size;
        if (team.members.length < minSize) {
          // Add more agents up to minimum size
          const remainingAgents = candidateAgents.filter(a => !team.members.includes(a.id));
          const additionalCount = minSize - team.members.length;
          
          // Add the best remaining agents
          for (let i = 0; i < Math.min(additionalCount, remainingAgents.length); i++) {
            team.members.push(remainingAgents[i].id);
          }
        }
        break;
    }
  }
  
  private extractSkillsFromRoles(roles: Role[]): Skill[] {
    // Extract unique skills from roles
    const skillMap = new Map<string, Skill>();
    
    for (const role of roles) {
      for (const skill of role.requiredSkills) {
        const existing = skillMap.get(skill.name);
        if (!existing || existing.level < skill.level) {
          skillMap.set(skill.name, skill);
        }
      }
    }
    
    return Array.from(skillMap.values());
  }
}
```

### Consensus Building Implementation

```typescript
// Consensus Engine
class ConsensusEngine {
  private participants: Map<string, BaseAgent>;
  private votingSessions: Map<string, VotingSession>;
  private votingStrategies: Map<string, VotingStrategy>;
  
  constructor(private agentManager: AgentLifecycleManager) {
    this.participants = new Map();
    this.votingSessions = new Map();
    this.votingStrategies = new Map();
    
    // Register default voting strategies
    this.registerVotingStrategy(new MajorityVotingStrategy());
    this.registerVotingStrategy(new SuperMajorityVotingStrategy());
    this.registerVotingStrategy(new UnanimousVotingStrategy());
    this.registerVotingStrategy(new WeightedVotingStrategy());
  }
  
  registerVotingStrategy(strategy: VotingStrategy): void {
    this.votingStrategies.set(strategy.name, strategy);
  }
  
  async initiateVoting(
    topic: string,
    options: string[],
    strategy: string,
    deadline: Date,
    participantIds: string[]
  ): Promise<VotingSession> {
    // Validate strategy
    if (!this.votingStrategies.has(strategy)) {
      throw new Error(`Unknown voting strategy: ${strategy}`);
    }
    
    // Validate options
    if (options.length < 2) {
      throw new Error('At least two options are required for voting');
    }
    
    // Validate deadline
    if (deadline < new Date()) {
      throw new Error('Deadline cannot be in the past');
    }
    
    // Validate participants
    const participants: BaseAgent[] = [];
    for (const id of participantIds) {
      try {
        const agent = await this.agentManager.getAgent(id);
        participants.push(agent);
        this.participants.set(id, agent);
      } catch (error) {
        console.warn(`Could not find agent ${id} for voting session`);
      }
    }
    
    if (participants.length === 0) {
      throw new Error('No valid participants for voting session');
    }
    
    // Create voting session
    const sessionId = uuidv4();
    const session: VotingSession = {
      id: sessionId,
      topic,
      options,
      strategy,
      deadline,
      participants: participantIds,
      votes: [],
      status: 'active',
      createdAt: new Date(),
      results: null
    };
    
    // Store session
    this.votingSessions.set(sessionId, session);
    
    // Notify participants
    for (const agent of participants) {
      await agent.processMessage({
        id: uuidv4(),
        sender: { id: 'system', name: 'System' },
        recipients: [{ id: agent.id, name: agent.name }],
        timestamp: new Date(),
        priority: 'MEDIUM',
        content: {
          type: 'VOTING_REQUEST',
          votingSessionId: sessionId,
          topic,
          options,
          deadline
        },
        requiresAcknowledgment: true
      });
    }
    
    // Schedule deadline check
    const timeUntilDeadline = deadline.getTime() - Date.now();
    setTimeout(() => {
      this.checkVotingDeadline(sessionId).catch(error => {
        console.error(`Error checking voting deadline for session ${sessionId}:`, error);
      });
    }, timeUntilDeadline);
    
    return session;
  }
  
  async castVote(
    sessionId: string,
    agentId: string,
    vote: Vote
  ): Promise<void> {
    // Get voting session
    const session = this.votingSessions.get(sessionId);
    if (!session) {
      throw new Error(`Voting session ${sessionId} not found`);
    }
    
    // Check if session is active
    if (session.status !== 'active') {
      throw new Error(`Voting session ${sessionId} is not active`);
    }
    
    // Check if deadline has passed
    if (session.deadline < new Date()) {
      throw new Error(`Voting deadline for session ${sessionId} has passed`);
    }
    
    // Check if agent is a participant
    if (!session.participants.includes(agentId)) {
      throw new Error(`Agent ${agentId} is not a participant in voting session ${sessionId}`);
    }
    
    // Check if option is valid
    if (!session.options.includes(vote.option)) {
      throw new Error(`Invalid voting option: ${vote.option}`);
    }
    
    // Check if agent has already voted
    const existingVoteIndex = session.votes.findIndex(v => v.agentId === agentId);
    if (existingVoteIndex >= 0) {
      // Update existing vote
      session.votes[existingVoteIndex] = {
        agentId,
        option: vote.option,
        timestamp: new Date(),
        confidence: vote.confidence || 1.0,
        rationale: vote.rationale
      };
    } else {
      // Add new vote
      session.votes.push({
        agentId,
        option: vote.option,
        timestamp: new Date(),
        confidence: vote.confidence || 1.0,
        rationale: vote.rationale
      });
    }
    
    // Check if all participants have voted
    if (session.votes.length === session.participants.length) {
      // All votes are in, resolve consensus
      await this.resolveConsensus(sessionId);
    }
  }
  
  async getVotingResults(
    sessionId: string
  ): Promise<VotingResults> {
    // Get voting session
    const session = this.votingSessions.get(sessionId);
    if (!session) {
      throw new Error(`Voting session ${sessionId} not found`);
    }
    
    // If results already calculated, return them
    if (session.results) {
      return session.results;
    }
    
    // Calculate results
    const strategy = this.votingStrategies.get(session.strategy);
    const results = strategy.calculateResult(session.votes);
    
    // Store results if session is complete
    if (session.status === 'completed') {
      session.results = results;
    }
    
    return results;
  }
  
  async resolveConsensus(
    sessionId: string
  ): Promise<ConsensusResolution> {
    // Get voting session
    const session = this.votingSessions.get(sessionId);
    if (!session) {
      throw new Error(`Voting session ${sessionId} not found`);
    }
    
    // Calculate results
    const strategy = this.votingStrategies.get(session.strategy);
    const results = strategy.calculateResult(session.votes);
    
    // Check if consensus is reached
    const consensusReached = strategy.hasReachedConsensus(results);
    
    // Update session status
    session.status = 'completed';
    session.results = results;
    
    // Create resolution
    const resolution: ConsensusResolution = {
      sessionId,
      consensusReached,
      results,
      decision: consensusReached ? results.winner : null
