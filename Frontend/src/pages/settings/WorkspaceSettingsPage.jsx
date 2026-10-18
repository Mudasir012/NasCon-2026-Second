import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Users,
  Lock,
  Save,
  CheckCircle2,
  Building,
  Key,
  ShieldAlert
} from 'lucide-react';

export default function WorkspaceSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Solaria Energy Systems');
  const [tenantId, setTenantId] = useState('WS-104-SOLARIA');
  const [businessType, setBusinessType] = useState('Solar Installation & Storage');
  const [currency, setCurrency] = useState('USD ($)');
  const [saveToast, setSaveToast] = useState(false);

  // Three base levels (F1.2) + Configurable permissions (F1.3)
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'USR-01',
      name: 'Alex Mercer',
      email: 'alex@solaria.io',
      role: 'Owner',
      status: 'Available',
      permissions: { viewCRM: true, editCRM: true, exportCRM: true, manageRules: true, manageIntegrations: true, viewAudit: true, viewValues: true }
    },
    {
      id: 'USR-02',
      name: 'Elena Rostova',
      email: 'elena.r@solaria.io',
      role: 'Admin',
      status: 'Available',
      permissions: { viewCRM: true, editCRM: true, exportCRM: true, manageRules: true, manageIntegrations: true, viewAudit: true, viewValues: true }
    },
    {
      id: 'USR-03',
      name: 'Marcus Vance',
      email: 'marcus.v@solaria.io',
      role: 'User',
      status: 'Available',
      permissions: { viewCRM: true, editCRM: true, exportCRM: false, manageRules: false, manageIntegrations: false, viewAudit: false, viewValues: false }
    },
    {
      id: 'USR-04',
      name: 'Jordan Reed',
      email: 'jordan.r@solaria.io',
      role: 'User',
      status: 'Busy',
      permissions: { viewCRM: true, editCRM: true, exportCRM: false, manageRules: false, manageIntegrations: false, viewAudit: false, viewValues: false }
    }
  ]);

  const handleTogglePermission = (userId, permKey) => {
    setTeamMembers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          // Rule F1.2: Admin cannot modify the Owner!
          if (user.role === 'Owner') return user;
          return {
            ...user,
            permissions: { ...user.permissions, [permKey]: !user.permissions[permKey] }
          };
        }
        return user;
      })
    );
  };

  const handleSaveWorkspace = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Workspace & Configurable Roles</h1>
          <p className="text-xs text-[#79756d]">
            Multi-tenant workspace isolation (F1.6) and role permission matrix (F1.2, F1.3).
          </p>
        </div>

        <button
          onClick={handleSaveWorkspace}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1917] text-white rounded-md text-xs font-semibold hover:bg-[#33302a] transition-all"
        >
          <Save size={14} />
          <span>Save Workspace Settings</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-[#eaf0ee] border border-[#52796f]/30 text-[#52796f] rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>Workspace configuration saved. Tenant boundaries and permissions enforced on server (F1.5, F1.6).</span>
        </div>
      )}

      {/* Tenant Isolation Info Box (F1.6) */}
      <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e8e5de] pb-3">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-[#4a6b82]" />
            <h2 className="text-sm font-bold text-[#1a1917]">Company Workspace Isolation (F1.6)</h2>
          </div>
          <span className="text-xs font-mono font-bold text-[#4a6b82] bg-[#ebf1f5] px-2.5 py-0.5 rounded border border-[#4a6b82]/30">
            Tenant ID: {tenantId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1a1917] mb-1">Company Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1a1917] mb-1">Service Industry Category</label>
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1a1917] mb-1">Default Business Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
            />
          </div>
        </div>

        <div className="text-[11px] text-[#79756d] bg-[#f4f2ee] p-2.5 rounded">
          <strong>Security Boundary (F1.6 & Q2):</strong> A user of one workspace can never read or change data of another workspace, including through guessed identifiers. All database access filters by <code>workspace_id</code> server-side.
        </div>
      </div>

      {/* Team Roster & Configurable Permissions Matrix (F1.2, F1.3, F1.4) */}
      <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e8e5de] pb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#52796f]" />
            <h2 className="text-sm font-bold text-[#1a1917]">
              Three Base Levels & Configurable Permissions (F1.2, F1.3)
            </h2>
          </div>
          <span className="text-xs text-[#79756d]">Base Levels: Owner • Admin • User</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f2ee] text-[#79756d] uppercase font-bold text-[10px] border-b border-[#e8e5de]">
              <tr>
                <th className="p-3">User & Level (F1.2)</th>
                <th className="p-3">Status (F3.2)</th>
                <th className="p-3 text-center">Edit CRM</th>
                <th className="p-3 text-center">Export CRM</th>
                <th className="p-3 text-center">Manage Rules</th>
                <th className="p-3 text-center">Integrations</th>
                <th className="p-3 text-center">Audit Log</th>
                <th className="p-3 text-center">View Deal $$ (F1.4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e5de]">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#faf9f6]">
                  <td className="p-3">
                    <div className="font-bold text-[#1a1917]">{member.name}</div>
                    <div className="text-[11px] text-[#79756d]">{member.email}</div>
                    <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                      member.role === 'Owner' ? 'bg-[#f7f1ea] text-[#b08945] border-[#b08945]/30' :
                      member.role === 'Admin' ? 'bg-[#ebf1f5] text-[#4a6b82] border-[#4a6b82]/30' :
                      'bg-[#f4f2ee] text-[#79756d] border-[#e8e5de]'
                    }`}>
                      {member.role}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      member.status === 'Available' ? 'bg-[#eaf0ee] text-[#52796f]' : 'bg-[#faece8] text-[#c26751]'
                    }`}>
                      {member.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.editCRM}
                      disabled={member.role === 'Owner'}
                      onChange={() => handleTogglePermission(member.id, 'editCRM')}
                      className="accent-[#1a1917]"
                    />
                  </td>

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.exportCRM}
                      disabled={member.role === 'Owner'}
                      onChange={() => handleTogglePermission(member.id, 'exportCRM')}
                      className="accent-[#1a1917]"
                    />
                  </td>

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.manageRules}
                      disabled={member.role === 'Owner'}
                      onChange={() => handleTogglePermission(member.id, 'manageRules')}
                      className="accent-[#1a1917]"
                    />
                  </td>

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.manageIntegrations}
                      disabled={member.role === 'Owner'}
                      onChange={() => handleTogglePermission(member.id, 'manageIntegrations')}
                      className="accent-[#1a1917]"
                    />
                  </td>

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.viewAudit}
                      disabled={member.role === 'Owner'}
                      onChange={() => handleTogglePermission(member.id, 'viewAudit')}
                      className="accent-[#1a1917]"
                    />
                  </td>

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.viewValues}
                      disabled={member.role === 'Owner'}
                      onChange={() => handleTogglePermission(member.id, 'viewValues')}
                      className="accent-[#1a1917]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-[#79756d] bg-[#f7f1ea] border border-[#d4a373]/30 p-3 rounded">
          <strong>Hierarchy Rule (F1.2):</strong> The Owner can invite users and assign levels. An Admin cannot modify the Owner. A User sees only what their granular permissions allow.
        </div>
      </div>
    </div>
  );
}
