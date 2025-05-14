import React from 'react';
import './App.css';
import HealthDashboard from './components/HealthDashboard.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Agentic System Dashboard</h1>
      </header>
      <main className="App-main">
        <div className="dashboard-container">
          <HealthDashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
