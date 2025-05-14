import { getServer, getServerStatus } from './serverRegistry';

export const getServerConfig = (serverName) => {
  const server = getServer(serverName);
  if (!server) {
    throw new Error(`Server ${serverName} not found`);
  }
  return {
    name: server.name,
    url: server.url,
    description: server.description,
    version: server.version,
    config: server.config || {}
  };
};

export const updateServerConfig = async (serverName, configUpdates) => {
  const server = getServer(serverName);
  if (!server) {
    throw new Error(`Server ${serverName} not found`);
  }

  // Validate config updates
  if (configUpdates.resources) {
    if (configUpdates.resources.cpu < 0.5 || configUpdates.resources.memory < 256) {
      throw new Error('Minimum resources not met (0.5 CPU, 256MB RAM required)');
    }
  }

  // Apply updates
  server.config = {
    ...(server.config || {}),
    ...configUpdates,
    lastUpdated: new Date().toISOString()
  };

  // Verify server can handle new config
  const status = await getServerStatus(serverName);
  if (status.status !== 'healthy') {
    throw new Error(`Cannot update config - server is ${status.status}`);
  }

  return server;
};

export const getConfigSchema = (serverType) => {
  const schemas = {
    'task-queue': {
      resources: {
        cpu: { type: 'number', min: 0.5, max: 16, step: 0.5 },
        memory: { type: 'number', min: 256, max: 32768, step: 256 }
      },
      concurrency: { type: 'number', min: 1, max: 100 }
    },
    'database': {
      resources: {
        cpu: { type: 'number', min: 1, max: 32, step: 1 },
        memory: { type: 'number', min: 1024, max: 65536, step: 1024 }
      },
      poolSize: { type: 'number', min: 1, max: 100 }
    }
  };

  return schemas[serverType] || {};
};
