import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import OperationalDashboardPage from './pages/dashboard/OperationalDashboardPage';

function App() {
  const [inApp, setInApp] = useState(false);

  if (inApp) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0a0d14)', color: '#fff', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>OmniFlow Internal Workspace</h2>
          <button
            onClick={() => setInApp(false)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            ← Back to Landing Page
          </button>
        </div>
        <OperationalDashboardPage />
      </div>
    );
  }

  return <LandingPage onEnterApp={() => setInApp(true)} />;
}

export default App;
