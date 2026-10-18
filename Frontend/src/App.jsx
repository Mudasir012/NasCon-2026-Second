import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import { ToastProvider } from './components/common/Toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
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
import TeamRolesPage from './pages/settings/TeamRolesPage';
import IntegrationsHubPage from './pages/integrations/IntegrationsHubPage';
import SyncHistoryPage from './pages/integrations/SyncHistoryPage';
import AuditHistoryPage from './pages/audit/AuditHistoryPage';
import WorkspaceSettingsPage from './pages/settings/WorkspaceSettingsPage';
import ForbiddenPage from './pages/error/ForbiddenPage';
import NotFoundPage from './pages/error/NotFoundPage';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState('landing');

  // Public Unauthenticated Pages
  if (currentRoute === 'landing') {
    return <LandingPage onEnterApp={(target = 'dashboard') => setCurrentRoute(target)} />;
  }

  if (currentRoute === 'login') {
    return <LoginPage onNavigate={(target) => setCurrentRoute(target)} />;
  }

  if (currentRoute === 'signup') {
    return <SignupPage onNavigate={(target) => setCurrentRoute(target)} />;
  }

  // Authenticated AppShell Layout
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
      {currentRoute === 'team' && <TeamRolesPage />}
      {currentRoute === 'integrations' && <IntegrationsHubPage onNavigate={setCurrentRoute} />}
      {currentRoute === 'sync' && <SyncHistoryPage onNavigate={setCurrentRoute} />}
      {currentRoute === 'audit' && <AuditHistoryPage onNavigate={setCurrentRoute} />}
      {currentRoute === 'settings' && <WorkspaceSettingsPage />}
      {currentRoute === '403' && <ForbiddenPage onBack={() => setCurrentRoute('dashboard')} />}
      {currentRoute === '404' && <NotFoundPage onBack={() => setCurrentRoute('dashboard')} />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CRMProvider>
    </AuthProvider>
  );
}
