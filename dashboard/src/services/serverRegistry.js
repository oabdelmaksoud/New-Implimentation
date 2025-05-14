const servers = new Map();

export const registerServer = (server) => {
  servers.set(server.name, {
    name: server.name,
    url: server.url,
    description: server.description,
    version: server.version,
    lastSeen: Date.now()
  });
};

export const unregisterServer = (serverName) => {
  servers.delete(serverName);
};

export const getMcpServers = () => {
  return Array.from(servers.values());
};

export const getServer = (serverName) => {
  return servers.get(serverName);
};

// Auto-register known MCP servers
registerServer({
  name: 'TaskQueue',
  url: 'http://localhost:3001',
  description: 'Task queue management',
  version: '1.0.0'
});

registerServer({
  name: 'DatabaseConnector',
  url: 'http://localhost:3002',
  description: 'Database access layer',
  version: '1.0.0'
});

registerServer({
  name: 'APIGateway',
  url: 'http://localhost:3003',
  description: 'API gateway service',
  version: '1.0.0'
});

registerServer({
  name: 'Monitoring',
  url: 'http://localhost:3004',
  description: 'Monitoring and analytics',
  version: '1.0.0'
});

registerServer({
  name: 'GitHubIntegration',
  url: 'http://localhost:3005',
  description: 'GitHub API integration',
  version: '1.0.0'
});

export const getServerStatus = async (serverName) => {
  const server = servers.get(serverName);
  if (!server) return { status: 'not_found' };

  try {
    const response = await fetch(`${server.url}/health`);
    if (!response.ok) throw new Error('Health check failed');
    const data = await response.json();
    return { 
      status: 'healthy',
      details: data,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return { 
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
};
