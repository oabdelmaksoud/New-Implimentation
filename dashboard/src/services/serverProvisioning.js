import { registerServer, getServerStatus } from './serverRegistry';

const PROVISIONING_API = process.env.PROVISIONING_API || 'http://localhost:3006';

export const provisionServer = async (serverConfig) => {
  try {
    const response = await fetch(`${PROVISIONING_API}/servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serverConfig)
    });

    if (!response.ok) {
      throw new Error('Failed to provision server');
    }

    const server = await response.json();
    registerServer(server);
    return server;
  } catch (error) {
    console.error('Provisioning error:', error);
    throw error;
  }
};

export const deprovisionServer = async (serverName) => {
  try {
    const response = await fetch(`${PROVISIONING_API}/servers/${serverName}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to deprovision server');
    }

    return true;
  } catch (error) {
    console.error('Deprovisioning error:', error);
    throw error;
  }
};

export const getProvisioningOptions = async () => {
  try {
    const response = await fetch(`${PROVISIONING_API}/options`);
    if (!response.ok) {
      throw new Error('Failed to get provisioning options');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting options:', error);
    throw error;
  }
};

export const validateServerConfig = (config) => {
  const requiredFields = ['name', 'type', 'resources'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (config.resources.cpu < 1 || config.resources.memory < 512) {
    throw new Error('Minimum resources not met (1 CPU, 512MB RAM required)');
  }

  return true;
};
