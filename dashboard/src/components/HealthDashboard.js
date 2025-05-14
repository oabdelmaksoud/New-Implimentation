import React, { useState, useEffect } from 'react';
import './HealthDashboard.css';

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const servers = await import('../services/serverRegistry.js');
        const serverStatuses = {};
        
        // Check status for each registered MCP server
        for (const server of servers.getMcpServers()) {
          const status = await servers.getServerStatus(server.name);
          serverStatuses[server.name] = {
            status: status.status,
            metrics: status.details,
            timestamp: status.lastChecked
          };
        }
        
        setHealthData(serverStatuses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="health-loading">Loading health data...</div>;
  if (error) return <div className="health-error">Error: {error}</div>;

  return (
    <div className="health-dashboard">
      <h2>System Health Overview</h2>
      <div className="health-grid">
        {healthData && Object.entries(healthData).map(([server, status]) => (
          <div key={server} className={`health-card ${status.status}`}>
            <h3>{server}</h3>
            <p>Status: {status.status}</p>
            <p>Uptime: {status.metrics?.uptime || 'N/A'}</p>
            <p>Last Check: {new Date(status.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthDashboard;
