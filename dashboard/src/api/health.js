export async function getHealthStatus() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: 'operational',
      cache: 'operational'
    },
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  };
}
