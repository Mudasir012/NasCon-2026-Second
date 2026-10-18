import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Inbox,
  AlertOctagon,
  Sliders,
  Kanban,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  Users,
  Shield,
  FileText,
  Layers,
  Activity,
  Lock,
  RefreshCw,
  Bell,
  Clock
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import SessionExpiredModal from '../auth/SessionExpiredModal';

export default function AppLayout({ currentRoute, onNavigate, onExit, children }) {
  const { currentUser, switchRole, hasPermission, logout, triggerSessionExpired } = useAuth();

  // Employee availability status state
  const [empStatus, setEmpStatus] = useState('Available');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAbsenceNotice, setShowAbsenceNotice] = useState(false);

  // Profile menu and Role Switcher dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Global search modal state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // All potential navigation items with their required permission
  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Operational Dashboard',
      icon: LayoutDashboard,
      permission: null
    },
    {
      id: 'leads',
      label: 'Leads Ledger',
      icon: Inbox,
      permission: 'crm.view'
    },
    {
      id: 'recovery',
      label: 'Recovery Queue',
      icon: AlertOctagon,
      permission: 'rules.manage',
      badge: '3',
      badgeColor: 'bg-[#faece8] text-[#c26751] border-[#c26751]/30'
    },
    {
      id: 'rules',
      label: 'Assignment & SLA Rules',
      icon: Sliders,
      permission: 'rules.manage'
    },
    {
      id: 'pipeline',
      label: 'Custom Pipeline',
      icon: Kanban,
      permission: 'crm.view'
    },
    {
      id: 'opportunity',
      label: 'Opportunity Detail',
      icon: FileSpreadsheet,
      permission: 'crm.view'
    },
    {
      id: 'team',
      label: 'Team & RBAC Roles',
      icon: Users,
      permission: 'users.manage'
    },
    {
      id: 'integrations',
      label: 'Integrations Hub',
      icon: Layers,
      permission: 'integrations.manage'
    },
    {
      id: 'sync',
      label: 'Sync History & Logs',
      icon: Activity,
      permission: 'integrations.manage'
    },
    {
      id: 'audit',
      label: 'Audit History',
      icon: FileText,
      permission: 'audit.view'
    },
    {
      id: 'settings',
      label: 'Workspace Settings',
      icon: Settings,
      permission: 'settings.manage'
    }
  ];

  // Filtered by permissions (Person A AppShell requirement)
  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handleStatusChange = (status) => {
    setEmpStatus(status);
    setShowStatusMenu(false);
    if (status === 'On leave' || status === 'Offline') {
      setShowAbsenceNotice(true);
      setTimeout(() => setShowAbsenceNotice(false), 5000);
    }
  };

  const handleSelectRole = (role) => {
    switchRole(role);
    setShowRoleMenu(false);
    setShowProfileMenu(false);
  };

  // Search Results Simulation
  const searchResults = [
    { title: 'Sarah Jenkins (Commercial Solar)', type: 'Lead', route: 'leads' },
    { title: 'Apex Commercial Roof ($48,000)', type: 'Opportunity', route: 'opportunity' },
    { title: 'Twilio WhatsApp Sandbox Webhook', type: 'Integration', route: 'integrations' },
    { title: 'Solar Inbound SLA Rule #3', type: 'SLA Rule', route: 'rules' },
    { title: 'Alex Mercer (Primary Owner)', type: 'Member', route: 'team' },
    { title: 'Sara Chen (Admin)', type: 'Member', route: 'team' }
  ].filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#3c3933] flex flex-col font-sans">
      <SessionExpiredModal />

      {/* Global Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e8e5de] bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 text-[#79756d] hover:text-[#1a1917] rounded hover:bg-[#f4f2ee]"
            >
              <Menu size={20} />
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#4a6b82] text-white">
                <ShieldCheck size={16} />
              </div>
              <span className="font-bold text-[#1a1917] text-sm tracking-tight">OmniFlow</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#f4f2ee] border border-[#e8e5de] text-[11px] font-semibold text-[#1a1917]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#52796f]"></span>
              {currentUser?.tenant || 'Solaria Energy Systems (Tenant #WS-104)'}
            </div>
          </div>

          {/* Center: Global Search Box */}
          <div className="hidden sm:flex items-center flex-1 max-w-xs mx-4">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#79756d] bg-[#f4f2ee] hover:bg-[#e8e5de] border border-[#e8e5de] rounded-md transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search size={13} />
                <span>Search leads, deals, members...</span>
              </span>
              <kbd className="px-1.5 py-0.2 bg-white border border-[#d3cfc7] rounded text-[10px] text-[#79756d] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Availability, Role Switcher, Profile Menu */}
          <div className="flex items-center gap-2.5">
            {/* Employee Availability Pill (F3.2, F3.6) */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  empStatus === 'Available' ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30' :
                  empStatus === 'Busy' ? 'bg-[#f8f3e9] text-[#b08945] border-[#b08945]/30' :
                  'bg-[#faece8] text-[#c26751] border-[#c26751]/30'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  empStatus === 'Available' ? 'bg-[#52796f]' :
                  empStatus === 'Busy' ? 'bg-[#b08945]' : 'bg-[#c26751]'
                }`}></span>
                <span className="hidden sm:inline">{empStatus}</span>
                <ChevronDown size={11} />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-md border border-[#e8e5de] bg-white p-1 shadow-md z-50 text-xs">
                  {['Available', 'Busy', 'On leave', 'Offline'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className="w-full text-left px-3 py-1.5 rounded hover:bg-[#f4f2ee] text-[#1a1917] font-medium cursor-pointer"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Role Switcher Pill (Person A Mock Auth & Permission Switcher) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#faf9f6] border border-[#d3cfc7] text-xs font-bold text-[#1a1917] hover:bg-[#f4f2ee] transition-colors cursor-pointer"
                title="Switch active role to test RBAC"
              >
                <Shield size={12} className="text-[#4a6b82]" />
                <span>{currentUser?.role || 'Owner'}</span>
                <ChevronDown size={11} className="text-[#79756d]" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-md border border-[#e8e5de] bg-white p-1.5 shadow-lg z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#79756d] border-b border-[#e8e5de] mb-1">
                    Simulate RBAC Role:
                  </div>
                  {['Owner', 'Admin', 'Manager', 'User'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSelectRole(r)}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-xs font-medium cursor-pointer ${
                        currentUser?.role === r ? 'bg-[#1a1917] text-white' : 'hover:bg-[#f4f2ee] text-[#1a1917]'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser?.role === r && <span className="text-[10px]">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-[#e8e5de] hidden sm:block"></div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#f4f2ee] transition-colors cursor-pointer"
              >
                <div className="h-7 w-7 rounded-full bg-[#ebf1f5] text-[#4a6b82] flex items-center justify-center font-bold text-xs">
                  {currentUser?.avatar || 'AM'}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-[#e8e5de] bg-white p-2 shadow-lg z-50 text-xs">
                  <div className="px-2.5 py-2 border-b border-[#e8e5de] mb-1">
                    <div className="font-bold text-[#1a1917]">{currentUser?.name || 'Alex Mercer'}</div>
                    <div className="text-[11px] text-[#79756d] truncate">{currentUser?.email}</div>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#eaf0ee] text-[#52796f]">
                      {currentUser?.role} Authority
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('team');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f4f2ee] text-[#1a1917] flex items-center gap-2 cursor-pointer"
                  >
                    <Users size={13} /> Team & Permissions
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      triggerSessionExpired();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f4f2ee] text-[#b08945] flex items-center gap-2 cursor-pointer"
                  >
                    <Clock size={13} /> Simulate Session Timeout
                  </button>

                  <div className="border-t border-[#e8e5de] my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      if (onExit) onExit();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#faece8] text-[#c26751] flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Back to landing button */}
            <button
              onClick={onExit}
              title="Return to Public Landing Page"
              className="p-1.5 text-[#79756d] hover:text-[#1a1917] rounded hover:bg-[#f4f2ee] transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar (Filtered by Permissions) */}
        <div className="border-t border-[#e8e5de] bg-[#faf9f6]">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[#1a1917] text-[#1a1917] bg-white'
                      : 'border-transparent text-[#79756d] hover:text-[#1a1917] hover:bg-white/50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Immediate Reassignment Banner (F3.6) */}
      {showAbsenceNotice && (
        <div className="w-full bg-[#faece8] border-b border-[#c26751]/30 px-6 py-2.5 text-xs text-[#c26751] font-semibold text-center flex items-center justify-center gap-2">
          <span>Status changed to {empStatus}: All unacknowledged leads immediately reassigned to next eligible Available employee (F3.6).</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
        {children}
      </main>

      {/* Mobile Drawer (Person A Mobile Navigation Requirement) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          ></div>
          <div className="relative w-64 max-w-xs bg-white h-full shadow-2xl z-50 flex flex-col p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e5de] mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#4a6b82] text-white">
                  <ShieldCheck size={14} />
                </div>
                <span className="font-bold text-[#1a1917] text-sm">OmniFlow</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded text-[#79756d] hover:text-[#1a1917]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                      isActive
                        ? 'bg-[#1a1917] text-white'
                        : 'text-[#79756d] hover:bg-[#f4f2ee] hover:text-[#1a1917]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#e8e5de]">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onExit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#79756d] hover:bg-[#f4f2ee] rounded-md"
              >
                <LogOut size={14} /> Back to Landing Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal (Ctrl+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e8e5de] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e8e5de]">
              <Search size={16} className="text-[#79756d]" />
              <input
                type="text"
                placeholder="Search across leads, deals, members, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
                autoFocus
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-[11px] px-1.5 py-0.5 border border-[#d3cfc7] rounded text-[#79756d]"
              >
                ESC
              </button>
            </div>

            <div className="p-3 max-h-72 overflow-y-auto space-y-1">
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#79756d]">
                  No matching workspace items found.
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onNavigate(res.route);
                      setSearchModalOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f2ee] flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#1a1917]">{res.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#faf9f6] border border-[#e8e5de] text-[#79756d]">
                      {res.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
