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
  ChevronDown
} from 'lucide-react';

export default function AppLayout({ currentRoute, onNavigate, onExit, children }) {
  const [empStatus, setEmpStatus] = useState('Available');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAbsenceNotice, setShowAbsenceNotice] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Operational Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads Ledger', icon: Inbox },
    { id: 'recovery', label: 'Recovery Queue', icon: AlertOctagon, badge: '3', badgeColor: 'bg-[#faece8] text-[#c26751] border-[#c26751]/30' },
    { id: 'rules', label: 'Assignment & SLA Rules', icon: Sliders },
    { id: 'pipeline', label: 'Custom Pipeline', icon: Kanban },
    { id: 'opportunity', label: 'Opportunity Detail', icon: FileSpreadsheet },
    { id: 'settings', label: 'Workspace & Roles', icon: Settings }
  ];

  const handleStatusChange = (status) => {
    setEmpStatus(status);
    setShowStatusMenu(false);
    if (status === 'On leave' || status === 'Offline') {
      setShowAbsenceNotice(true);
      setTimeout(() => setShowAbsenceNotice(false), 5000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#3c3933] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e8e5de] bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#4a6b82] text-white">
                <ShieldCheck size={16} />
              </div>
              <span className="font-bold text-[#1a1917] text-sm">OmniFlow</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#f4f2ee] border border-[#e8e5de] text-xs font-semibold text-[#1a1917]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#52796f]"></span>
              Solaria Energy Systems (Tenant #WS-104)
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Employee Availability Pill (F3.2, F3.6) */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  empStatus === 'Available' ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30' :
                  empStatus === 'Busy' ? 'bg-[#f8f3e9] text-[#b08945] border-[#b08945]/30' :
                  'bg-[#faece8] text-[#c26751] border-[#c26751]/30'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  empStatus === 'Available' ? 'bg-[#52796f]' :
                  empStatus === 'Busy' ? 'bg-[#b08945]' : 'bg-[#c26751]'
                }`}></span>
                <span>{empStatus}</span>
                <ChevronDown size={12} />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-1.5 w-40 rounded-md border border-[#e8e5de] bg-white p-1 shadow-md z-50 text-xs">
                  {['Available', 'Busy', 'On leave', 'Offline'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className="w-full text-left px-3 py-1.5 rounded hover:bg-[#f4f2ee] text-[#1a1917] font-medium"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-[#e8e5de]"></div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#ebf1f5] text-[#4a6b82] flex items-center justify-center font-bold text-xs">
                OW
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-semibold text-[#1a1917]">Alex Mercer</div>
                <div className="text-[10px] text-[#79756d]">Workspace Owner</div>
              </div>
            </div>

            <button
              onClick={onExit}
              title="Return to Public Landing Page"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#79756d] hover:text-[#1a1917] rounded hover:bg-[#f4f2ee] transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="border-t border-[#e8e5de] bg-[#faf9f6]">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-6 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
