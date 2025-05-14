# Agent Specialization and Skills

## Overview

The Agent Specialization and Skills component is the final part of the Agent Capabilities and Communication phase. It enables agents to develop specialized capabilities, acquire and improve skills, and adapt to specific domains. This document outlines the detailed implementation plan for the Agent Specialization and Skills system.

## Objectives

- Implement agent specialization mechanisms
- Create skill acquisition and improvement
- Develop domain-specific capabilities

## Tasks

1. **Skill Definition and Management**
   - Implement skill taxonomy and hierarchy
   - Create skill level definitions
   - Develop skill dependencies
   - Implement skill validation mechanisms

2. **Specialization Framework**
   - Create specialization domains
   - Implement domain-specific knowledge bases
   - Develop specialization training
   - Create specialization certification

3. **Skill Acquisition and Improvement**
   - Implement learning mechanisms
   - Create practice environments
   - Develop skill assessment
   - Implement skill improvement tracking

4. **Adaptive Specialization**
   - Create dynamic specialization based on tasks
   - Implement cross-domain skill transfer
   - Develop specialization evolution
   - Create specialization recommendation

## Micro-Level Implementation Details

### Skill System

```typescript
// Skill Definition
interface Skill {
  id: string;                     // Unique skill ID
  name: string;                   // Human-readable name
  description: string;            // Detailed description
  category: string;               // Skill category
  domain: string[];               // Applicable domains
  levels: SkillLevel[];           // Skill levels
  prerequisites: SkillPrerequisite[]; // Required skills
  assessmentCriteria: AssessmentCriterion[]; // How to assess this skill
  metadata: Map<string, any>;     // Additional metadata
}

// Skill Level
interface SkillLevel {
  level: number;                  // Level number (1-5)
  name: string;                   // Level name (e.g., "Beginner", "Expert")
  description: string;            // Level description
  capabilities: string[];         // Capabilities at this level
  assessmentThreshold: number;    // Score needed to achieve this level
}

// Skill Prerequisite
interface SkillPrerequisite {
  skillId: string;                // Required skill ID
  minLevel: number;               // Minimum level required
  optional: boolean;              // Whether this prerequisite is optional
}

// Assessment Criterion
interface AssessmentCriterion {
  id: string;                     // Criterion ID
  name: string;                   // Criterion name
  description: string;            // Criterion description
  weight: number;                 // Weight in overall assessment
  evaluationMethod: string;       // How to evaluate this criterion
  passingThreshold: number;       // Minimum score to pass
}

// Agent Skill Profile
interface AgentSkillProfile {
  agentId: string;                // Agent ID
  skills: AgentSkill[];           // Agent's skills
  specializations: string[];      // Agent's specializations
  learningProgress: LearningProgress[]; // Current learning progress
  skillAssessments: SkillAssessment[]; // Past skill assessments
  metadata: Map<string, any>;     // Additional metadata
}

// Agent Skill
interface AgentSkill {
  skillId: string;                // Skill ID
  currentLevel: number;           // Current skill level
  experience: number;             // Experience points in this skill
  lastUsed: Date;                 // When skill was last used
  certifications: Certification[]; // Certifications for this skill
  history: SkillHistoryEntry[];   // Skill level history
}

// Learning Progress
interface LearningProgress {
  skillId: string;                // Skill being learned
  targetLevel: number;            // Target skill level
  startDate: Date;                // When learning started
  progress: number;               // Progress percentage (0-100)
  estimatedCompletionDate: Date;  // Estimated completion date
  learningActivities: LearningActivity[]; // Learning activities
}

// Learning Activity
interface LearningActivity {
  id: string;                     // Activity ID
  type: LearningActivityType;     // Activity type
  description: string;            // Activity description
  startDate: Date;                // When activity started
  endDate?: Date;                 // When activity completed
  status: ActivityStatus;         // Activity status
  progress: number;               // Progress percentage (0-100)
  result?: ActivityResult;        // Activity result
}

// Learning Activity Type
enum LearningActivityType {
  STUDY = 'study',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment',
  MENTORING = 'mentoring',
  PROJECT = 'project'
}

// Activity Status
enum ActivityStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Activity Result
interface ActivityResult {
  score: number;                  // Score achieved (0-100)
  feedback: string;               // Feedback on performance
  skillLevelGain: number;         // Skill level points gained
  strengths: string[];            // Identified strengths
  areasForImprovement: string[];  // Areas for improvement
}

// Skill Assessment
interface SkillAssessment {
  id: string;                     // Assessment ID
  skillId: string;                // Skill being assessed
  date: Date;                     // Assessment date
  assessor: string;               // Who performed the assessment
  overallScore: number;           // Overall score (0-100)
  criteriaScores: Map<string, number>; // Scores for each criterion
  levelAchieved: number;          // Skill level achieved
  feedback: string;               // Assessment feedback
  evidenceReferences: string[];   // References to evidence
}

// Certification
interface Certification {
  id: string;                     // Certification ID
  name: string;                   // Certification name
  issuer: string;                 // Certification issuer
  skillId: string;                // Related skill
  level: number;                  // Skill level certified
  issueDate: Date;                // When certification was issued
  expiryDate?: Date;              // When certification expires
  verificationUrl?: string;       // URL to verify certification
}

// Skill History Entry
interface SkillHistoryEntry {
  date: Date;                     // Entry date
  level: number;                  // Skill level at this date
  event: string;                  // What caused the change
  evidence?: string;              // Evidence for the change
}
```

### Skill Management System

```typescript
// Skill Management System
class SkillManagementSystem {
  private skills: Map<string, Skill>;
  private agentSkillProfiles: Map<string, AgentSkillProfile>;
  private skillCategories: Map<string, string[]>;
  private skillDomains: Map<string, string[]>;
  
  constructor(private db: Database) {
    this.skills = new Map();
    this.agentSkillProfiles = new Map();
    this.skillCategories = new Map();
    this.skillDomains = new Map();
  }
  
  async initialize(): Promise<void> {
    // Load skills from database
    const skillData = await this.db.skills.findAll();
    for (const data of skillData) {
      const skill: Skill = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        domain: data.domain,
        levels: data.levels,
        prerequisites: data.prerequisites,
        assessmentCriteria: data.assessment_criteria,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.skills.set(skill.id, skill);
      
      // Update category index
      if (!this.skillCategories.has(skill.category)) {
        this.skillCategories.set(skill.category, []);
      }
      this.skillCategories.get(skill.category).push(skill.id);
      
      // Update domain index
      for (const domain of skill.domain) {
        if (!this.skillDomains.has(domain)) {
          this.skillDomains.set(domain, []);
        }
        this.skillDomains.get(domain).push(skill.id);
      }
    }
    
    // Load agent skill profiles
    const profileData = await this.db.agentSkillProfiles.findAll();
    for (const data of profileData) {
      const profile: AgentSkillProfile = {
        agentId: data.agent_id,
        skills: data.skills,
        specializations: data.specializations,
        learningProgress: data.learning_progress,
        skillAssessments: data.skill_assessments,
        metadata: new Map(Object.entries(data.metadata || {}))
      };
      
      this.agentSkillProfiles.set(profile.agentId, profile);
    }
  }
  
  async getSkill(skillId: string): Promise<Skill> {
    // Check in memory
    if (this.skills.has(skillId)) {
      return this.skills.get(skillId);
    }
    
    // Get from database
    const skillData = await this.db.skills.findById(skillId);
    if (!skillData) {
      throw new Error(`Skill ${skillId} not found`);
    }
    
    // Convert to Skill object
    const skill: Skill = {
      id: skillData.id,
      name: skillData.name,
      description: skillData.description,
      category: skillData.category,
      domain: skillData.domain,
      levels: skillData.levels,
      prerequisites: skillData.prerequisites,
      assessmentCriteria: skillData.assessment_criteria,
      metadata: new Map(Object.entries(skillData.metadata || {}))
    };
    
    // Cache in memory
    this.skills.set(skillId, skill);
    
    return skill;
  }
  
  async createSkill(skillData: Omit<Skill, 'id'>): Promise<string> {
    // Generate skill ID
    const skillId = `skill-${Date.now()}`;
    
    // Create skill object
    const skill: Skill = {
      id: skillId,
      ...skillData
    };
    
    // Validate skill
    this.validateSkill(skill);
    
    // Store in memory
    this.skills.set(skillId, skill);
    
    // Update category index
    if (!this.skillCategories.has(skill.category)) {
      this.skillCategories.set(skill.category, []);
    }
    this.skillCategories.get(skill.category).push(skillId);
    
    // Update domain index
    for (const domain of skill.domain) {
      if (!this.skillDomains.has(domain)) {
        this.skillDomains.set(domain, []);
      }
      this.skillDomains.get(domain).push(skillId);
    }
    
    // Store in database
    await this.db.skills.create({
      id: skillId,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      domain: skill.domain,
      levels: skill.levels,
      prerequisites: skill.prerequisites,
      assessment_criteria: skill.assessmentCriteria,
      metadata: Object.fromEntries(skill.metadata)
    });
    
    return skillId;
  }
  
  async updateSkill(skillId: string, updates: Partial<Skill>): Promise<void> {
    // Get current skill
    const skill = await this.getSkill(skillId);
    
    // Apply updates
    const updatedSkill: Skill = {
      ...skill,
      ...updates,
      id: skill.id, // Ensure ID doesn't change
      metadata: new Map([...skill.metadata, ...(updates.metadata || new Map())])
    };
    
    // Validate updated skill
    this.validateSkill(updatedSkill);
    
    // Check if category changed
    if (updates.category && updates.category !== skill.category) {
      // Remove from old category
      const oldCategorySkills = this.skillCategories.get(skill.category) || [];
      this.skillCategories.set(
        skill.category,
        oldCategorySkills.filter(id => id !== skillId)
      );
      
      // Add to new category
      if (!this.skillCategories.has(updatedSkill.category)) {
        this.skillCategories.set(updatedSkill.category, []);
      }
      this.skillCategories.get(updatedSkill.category).push(skillId);
    }
    
    // Check if domains changed
    if (updates.domain) {
      // Remove from old domains
      for (const domain of skill.domain) {
        const domainSkills = this.skillDomains.get(domain) || [];
        this.skillDomains.set(
          domain,
          domainSkills.filter(id => id !== skillId)
        );
      }
      
      // Add to new domains
      for (const domain of updatedSkill.domain) {
        if (!this.skillDomains.has(domain)) {
          this.skillDomains.set(domain, []);
        }
        this.skillDomains.get(domain).push(skillId);
      }
    }
    
    // Update in memory
    this.skills.set(skillId, updatedSkill);
    
    // Update in database
    await this.db.skills.update(skillId, {
      name: updatedSkill.name,
      description: updatedSkill.description,
      category: updatedSkill.category,
      domain: updatedSkill.domain,
      levels: updatedSkill.levels,
      prerequisites: updatedSkill.prerequisites,
      assessment_criteria: updatedSkill.assessmentCriteria,
      metadata: Object.fromEntries(updatedSkill.metadata)
    });
  }
  
  async deleteSkill(skillId: string): Promise<void> {
    // Get skill
    const skill = await this.getSkill(skillId);
    
    // Check if skill is in use
    const inUse = await this.isSkillInUse(skillId);
    if (inUse) {
      throw new Error(`Cannot delete skill ${skillId} because it is in use`);
    }
    
    // Remove from memory
    this.skills.delete(skillId);
    
    // Remove from category index
    const categorySkills = this.skillCategories.get(skill.category) || [];
    this.skillCategories.set(
      skill.category,
      categorySkills.filter(id => id !== skillId)
    );
    
    // Remove from domain index
    for (const domain of skill.domain) {
      const domainSkills = this.skillDomains.get(domain) || [];
      this.skillDomains.set(
        domain,
        domainSkills.filter(id => id !== skillId)
      );
    }
    
    // Remove from database
    await this.db.skills.delete(skillId);
  }
  
  async getAgentSkillProfile(agentId: string): Promise<AgentSkillProfile> {
    // Check in memory
    if (this.agentSkillProfiles.has(agentId)) {
      return this.agentSkillProfiles.get(agentId);
    }
    
    // Get from database
    const profileData = await this.db.agentSkillProfiles.findByAgentId(agentId);
    if (!profileData) {
      // Create new profile if not found
      return this.createAgentSkillProfile(agentId);
    }
    
    // Convert to AgentSkillProfile object
    const profile: AgentSkillProfile = {
      agentId: profileData.agent_id,
      skills: profileData.skills,
      specializations: profileData.specializations,
      learningProgress: profileData.learning_progress,
      skillAssessments: profileData.skill_assessments,
      metadata: new Map(Object.entries(profileData.metadata || {}))
    };
    
    // Cache in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    return profile;
  }
  
  async createAgentSkillProfile(agentId: string): Promise<AgentSkillProfile> {
    // Create new profile
    const profile: AgentSkillProfile = {
      agentId,
      skills: [],
      specializations: [],
      learningProgress: [],
      skillAssessments: [],
      metadata: new Map()
    };
    
    // Store in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Store in database
    await this.db.agentSkillProfiles.create({
      agent_id: agentId,
      skills: [],
      specializations: [],
      learning_progress: [],
      skill_assessments: [],
      metadata: {}
    });
    
    return profile;
  }
  
  async addAgentSkill(
    agentId: string,
    skillId: string,
    level: number = 1
  ): Promise<void> {
    // Get skill
    const skill = await this.getSkill(skillId);
    
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Check if agent already has this skill
    const existingSkill = profile.skills.find(s => s.skillId === skillId);
    if (existingSkill) {
      throw new Error(`Agent ${agentId} already has skill ${skillId}`);
    }
    
    // Check if level is valid
    if (level < 1 || level > skill.levels.length) {
      throw new Error(`Invalid skill level: ${level}. Valid levels are 1-${skill.levels.length}`);
    }
    
    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const agentSkill = profile.skills.find(s => s.skillId === prereq.skillId);
      if (!agentSkill && !prereq.optional) {
        throw new Error(`Missing prerequisite skill: ${prereq.skillId}`);
      }
      if (agentSkill && agentSkill.currentLevel < prereq.minLevel) {
        throw new Error(`Prerequisite skill ${prereq.skillId} requires level ${prereq.minLevel}, but agent has level ${agentSkill.currentLevel}`);
      }
    }
    
    // Add skill to agent
    const newSkill: AgentSkill = {
      skillId,
      currentLevel: level,
      experience: 0,
      lastUsed: new Date(),
      certifications: [],
      history: [
        {
          date: new Date(),
          level,
          event: 'Skill added'
        }
      ]
    };
    
    profile.skills.push(newSkill);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      skills: profile.skills
    });
  }
  
  async updateAgentSkillLevel(
    agentId: string,
    skillId: string,
    newLevel: number,
    reason: string
  ): Promise<void> {
    // Get skill
    const skill = await this.getSkill(skillId);
    
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Find agent skill
    const agentSkill = profile.skills.find(s => s.skillId === skillId);
    if (!agentSkill) {
      throw new Error(`Agent ${agentId} does not have skill ${skillId}`);
    }
    
    // Check if level is valid
    if (newLevel < 1 || newLevel > skill.levels.length) {
      throw new Error(`Invalid skill level: ${newLevel}. Valid levels are 1-${skill.levels.length}`);
    }
    
    // Update skill level
    const oldLevel = agentSkill.currentLevel;
    agentSkill.currentLevel = newLevel;
    agentSkill.lastUsed = new Date();
    
    // Add history entry
    agentSkill.history.push({
      date: new Date(),
      level: newLevel,
      event: reason || `Level changed from ${oldLevel} to ${newLevel}`
    });
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      skills: profile.skills
    });
    
    // Check if any learning progress can be completed
    const learningProgress = profile.learningProgress.find(
      lp => lp.skillId === skillId && lp.targetLevel <= newLevel
    );
    
    if (learningProgress) {
      // Complete learning progress
      await this.completeLearningProgress(agentId, skillId);
    }
  }
  
  async addAgentSpecialization(
    agentId: string,
    specialization: string
  ): Promise<void> {
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Check if agent already has this specialization
    if (profile.specializations.includes(specialization)) {
      throw new Error(`Agent ${agentId} already has specialization ${specialization}`);
    }
    
    // Add specialization
    profile.specializations.push(specialization);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      specializations: profile.specializations
    });
  }
  
  async startLearningSkill(
    agentId: string,
    skillId: string,
    targetLevel: number
  ): Promise<void> {
    // Get skill
    const skill = await this.getSkill(skillId);
    
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Check if agent already has this skill
    const agentSkill = profile.skills.find(s => s.skillId === skillId);
    
    // Check if target level is valid
    if (targetLevel < 1 || targetLevel > skill.levels.length) {
      throw new Error(`Invalid target level: ${targetLevel}. Valid levels are 1-${skill.levels.length}`);
    }
    
    // Check if agent already has the target level
    if (agentSkill && agentSkill.currentLevel >= targetLevel) {
      throw new Error(`Agent ${agentId} already has skill ${skillId} at level ${agentSkill.currentLevel}, which is >= target level ${targetLevel}`);
    }
    
    // Check if agent is already learning this skill
    const existingProgress = profile.learningProgress.find(lp => lp.skillId === skillId);
    if (existingProgress) {
      // Update target level if higher
      if (targetLevel > existingProgress.targetLevel) {
        existingProgress.targetLevel = targetLevel;
        
        // Update in memory
        this.agentSkillProfiles.set(agentId, profile);
        
        // Update in database
        await this.db.agentSkillProfiles.update(agentId, {
          learning_progress: profile.learningProgress
        });
      }
      
      return;
    }
    
    // Create learning progress
    const learningProgress: LearningProgress = {
      skillId,
      targetLevel,
      startDate: new Date(),
      progress: 0,
      estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      learningActivities: []
    };
    
    // Add learning progress
    profile.learningProgress.push(learningProgress);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      learning_progress: profile.learningProgress
    });
    
    // Create initial learning activities
    await this.createLearningActivities(agentId, skillId);
  }
  
  async addLearningActivity(
    agentId: string,
    skillId: string,
    activity: Omit<LearningActivity, 'id'>
  ): Promise<string> {
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Find learning progress
    const learningProgress = profile.learningProgress.find(lp => lp.skillId === skillId);
    if (!learningProgress) {
      throw new Error(`Agent ${agentId} is not learning skill ${skillId}`);
    }
    
    // Generate activity ID
    const activityId = `activity-${Date.now()}`;
    
    // Create activity
    const newActivity: LearningActivity = {
      id: activityId,
      ...activity
    };
    
    // Add activity
    learningProgress.learningActivities.push(newActivity);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      learning_progress: profile.learningProgress
    });
    
    return activityId;
  }
  
  async completeLearningActivity(
    agentId: string,
    skillId: string,
    activityId: string,
    result: ActivityResult
  ): Promise<void> {
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Find learning progress
    const learningProgress = profile.learningProgress.find(lp => lp.skillId === skillId);
    if (!learningProgress) {
      throw new Error(`Agent ${agentId} is not learning skill ${skillId}`);
    }
    
    // Find activity
    const activity = learningProgress.learningActivities.find(a => a.id === activityId);
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }
    
    // Update activity
    activity.status = ActivityStatus.COMPLETED;
    activity.endDate = new Date();
    activity.progress = 100;
    activity.result = result;
    
    // Update learning progress
    await this.updateLearningProgress(agentId, skillId);
    
    // Check if agent has the skill
    const agentSkill = profile.skills.find(s => s.skillId === skillId);
    
    if (agentSkill) {
      // Update skill level if gained
      if (result.skillLevelGain > 0) {
        const newLevel = Math.min(
          agentSkill.currentLevel + result.skillLevelGain,
          learningProgress.targetLevel
        );
        
        if (newLevel > agentSkill.currentLevel) {
          await this.updateAgentSkillLevel(
            agentId,
            skillId,
            newLevel,
            `Completed learning activity: ${activity.description}`
          );
        }
      }
    } else {
      // Add skill if agent doesn't have it yet
      if (result.skillLevelGain > 0) {
        await this.addAgentSkill(agentId, skillId, result.skillLevelGain);
      }
    }
  }
  
  async completeLearningProgress(
    agentId: string,
    skillId: string
  ): Promise<void> {
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Find learning progress
    const learningProgressIndex = profile.learningProgress.findIndex(lp => lp.skillId === skillId);
    if (learningProgressIndex === -1) {
      throw new Error(`Agent ${agentId} is not learning skill ${skillId}`);
    }
    
    // Remove learning progress
    profile.learningProgress.splice(learningProgressIndex, 1);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      learning_progress: profile.learningProgress
    });
  }
  
  async conductSkillAssessment(
    agentId: string,
    skillId: string,
    assessment: Omit<SkillAssessment, 'id' | 'date'>
  ): Promise<string> {
    // Get skill
    const skill = await this.getSkill(skillId);
    
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Generate assessment ID
    const assessmentId = `assessment-${Date.now()}`;
    
    // Create assessment
    const newAssessment: SkillAssessment = {
      id: assessmentId,
      skillId,
      date: new Date(),
      ...assessment
    };
    
    // Add assessment
    profile.skillAssessments.push(newAssessment);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      skill_assessments: profile.skillAssessments
    });
    
    // Update skill level based on assessment
    const agentSkill = profile.skills.find(s => s.skillId === skillId);
    
    if (agentSkill) {
      // Update skill level if assessment level is different
      if (newAssessment.levelAchieved !== agentSkill.currentLevel) {
        await this.updateAgentSkillLevel(
          agentId,
          skillId,
          newAssessment.levelAchieved,
          `Skill assessment: ${newAssessment.overallScore}% score`
        );
      }
    } else {
      // Add skill if agent doesn't have it yet
      await this.addAgentSkill(agentId, skillId, newAssessment.levelAchieved);
    }
    
    return assessmentId;
  }
  
  async addCertification(
    agentId: string,
    skillId: string,
    certification: Omit<Certification, 'id'>
  ): Promise<string> {
    // Get agent profile
    const profile = await this.getAgentSkillProfile(agentId);
    
    // Find agent skill
    const agentSkill = profile.skills.find(s => s.skillId === skillId);
    if (!agentSkill) {
      throw new Error(`Agent ${agentId} does not have skill ${skillId}`);
    }
    
    // Generate certification ID
    const certificationId = `cert-${Date.now()}`;
    
    // Create certification
    const newCertification: Certification = {
      id: certificationId,
      ...certification
    };
    
    // Add certification
    agentSkill.certifications.push(newCertification);
    
    // Update in memory
    this.agentSkillProfiles.set(agentId, profile);
    
    // Update in database
    await this.db.agentSkillProfiles.update(agentId, {
      skills: profile.skills
    });
    
    return certificationId;
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const skillIds = this.skillCategories.get(category) || [];
    return Promise.all(skillIds.map(id => this.getSkill(id)));
  }
  
  async getSkillsByDomain(domain: string): Promise<Skill[]> {
    const skillIds = this.skillDomains.get(domain) || [];
