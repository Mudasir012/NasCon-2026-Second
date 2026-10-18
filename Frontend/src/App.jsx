import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/layout/AppLayout';
import OperationalDashboardPage from './pages/dashboard/OperationalDashboardPage';
import LeadsPage from './pages/escalation/LeadsPage';
import RecoveryQueuePage from './pages/escalation/RecoveryQueuePage';
import AssignmentRulesPage from './pages/escalation/AssignmentRulesPage';
import PipelinePage from './pages/crm/PipelinePage';
import OpportunityDetailPage from './pages/crm/OpportunityDetailPage';
import WorkspaceSettingsPage from './pages/settings/WorkspaceSettingsPage';

function App() {
  const [currentRoute, setCurrentRoute] = useState('landing');

  if (currentRoute === 'landing') {
    return <LandingPage onEnterApp={(target = 'dashboard') => setCurrentRoute(target)} />;
  }

  return (
    <AppLayout
      currentRoute={currentRoute}
      onNavigate={(route) => setCurrentRoute(route)}
      onExit={() => setCurrentRoute('landing')}
    >
      {currentRoute === 'dashboard' && <OperationalDashboardPage onNavigate={setCurrentRoute} />}
      {currentRoute === 'leads' && <LeadsPage onNavigate={setCurrentRoute} />}
      {currentRoute === 'recovery' && <RecoveryQueuePage onNavigate={setCurrentRoute} />}
      {currentRoute === 'rules' && <AssignmentRulesPage />}
      {currentRoute === 'pipeline' && <PipelinePage onNavigate={setCurrentRoute} />}
      {currentRoute === 'opportunity' && <OpportunityDetailPage />}
      {currentRoute === 'settings' && <WorkspaceSettingsPage />}
    </AppLayout>
  );
}

export default App;
