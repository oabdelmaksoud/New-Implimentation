const { UnauthorizedError } = require('./errors');

// Permission levels
const PERMISSION_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  EXECUTE: 'execute',
  ADMIN: 'admin'
};

// Resource types
const RESOURCE_TYPES = {
  TOOL: 'tool',
  DATA: 'data',
  SERVER: 'server',
  CONFIG: 'config'
};

// Default permissions for built-in roles
const ROLE_PERMISSIONS = {
  admin: {
    description: 'Full system access',
    permissions: [
      { resource: '*', actions: '*' }
    ]
  },
  developer: {
    description: 'Development access',
    permissions: [
      { resource: RESOURCE_TYPES.TOOL, actions: [PERMISSION_LEVELS.EXECUTE] },
      { resource: RESOURCE_TYPES.DATA, actions: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE] }
    ]
  },
  viewer: {
    description: 'Read-only access',
    permissions: [
      { resource: RESOURCE_TYPES.TOOL, actions: [PERMISSION_LEVELS.READ] },
      { resource: RESOURCE_TYPES.DATA, actions: [PERMISSION_LEVELS.READ] }
    ]
  }
};

// Server-specific permissions
const SERVER_PERMISSIONS = {
  'github-integration': {
    description: 'GitHub integration server',
    permissions: [
      { resource: 'repos', actions: [PERMISSION_LEVELS.READ] },
      { resource: 'issues', actions: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE] }
    ]
  },
  'database-connector': {
    description: 'Database connector server',
    permissions: [
      { resource: 'query', actions: [PERMISSION_LEVELS.EXECUTE] },
      { resource: 'schema', actions: [PERMISSION_LEVELS.READ] }
    ]
  }
};

class PermissionManager {
  constructor() {
    this.roles = ROLE_PERMISSIONS;
    this.serverPermissions = SERVER_PERMISSIONS;
  }

  checkPermission(user, resourceType, action, serverName = null) {
    // Admin has full access
    if (user.roles.includes('admin')) {
      return true;
    }

    // Check server-specific permissions first
    if (serverName && this.serverPermissions[serverName]) {
      const serverPerms = this.serverPermissions[serverName].permissions;
      const matchingPerm = serverPerms.find(perm => 
        perm.resource === resourceType && 
        (perm.actions === '*' || perm.actions.includes(action))
      );
      if (matchingPerm) return true;
    }

    // Check role-based permissions
    for (const role of user.roles) {
      if (this.roles[role]) {
        const rolePerms = this.roles[role].permissions;
        const matchingPerm = rolePerms.find(perm => 
          (perm.resource === '*' || perm.resource === resourceType) &&
          (perm.actions === '*' || perm.actions.includes(action))
        );
        if (matchingPerm) return true;
      }
    }

    throw new UnauthorizedError(
      `User ${user.id} lacks ${action} permission for ${resourceType}` +
      (serverName ? ` on server ${serverName}` : '')
    );
  }
}

module.exports = {
  PERMISSION_LEVELS,
  RESOURCE_TYPES,
  ROLE_PERMISSIONS,
  SERVER_PERMISSIONS,
  PermissionManager
};
