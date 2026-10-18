import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/layout/AppLayout';
import OperationalDashboardPage from './pages/dashboard/OperationalDashboardPage';
import LeadsPage from './pages/escalation/LeadsPage';
import RecoveryQueuePage from './pages/escalation/RecoveryQueuePage';
import AssignmentRulesPage from './pages/escalation/AssignmentRulesPage';
import PipelinePage from './pages/crm/PipelinePage';
import OpportunityDetailPage from './pages/crm/OpportunityDetailPage';
import CompaniesPage from './pages/crm/CompaniesPage';
import Contact from './pages/crm/Contact';
import ContactDetailPage from './pages/crm/ContactDetailPage';
import CustomFieldsPage from './pages/crm/CustomFieldsPage';
import MessagingChatPage from './pages/integrations/MessagingChatPage';
import PaymentsLedgerPage from './pages/integrations/PaymentsLedgerPage';
import CalendarBookingPage from './pages/integrations/CalendarBookingPage';
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
      {currentRoute === 'companies' && <CompaniesPage />}
      {currentRoute === 'contacts' && <Contact embedded />}
      {currentRoute === 'contact-detail' && <ContactDetailPage onNavigate={setCurrentRoute} />}
      {currentRoute === 'custom-fields' && <CustomFieldsPage />}
      {currentRoute === 'messaging' && <MessagingChatPage />}
      {currentRoute === 'payments' && <PaymentsLedgerPage />}
      {currentRoute === 'calendar' && <CalendarBookingPage />}
      {currentRoute === 'settings' && <WorkspaceSettingsPage />}
    </AppLayout>
  );
}

export default App;
