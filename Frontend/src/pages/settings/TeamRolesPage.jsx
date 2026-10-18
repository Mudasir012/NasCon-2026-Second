import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Mail,
  Lock,
  Trash2,
  Edit2,
  RotateCcw,
  Check,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';

export default function TeamRolesPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'roles'

  // Initial Members Data
  const [members, setMembers] = useState([
    {
      id: 'usr-1',
      name: 'Alex Mercer',
      email: 'alex@solaria.io',
      level: 'Owner',
      role: 'Owner',
      status: 'Active',
      isPrimaryOwner: true,
      lastActive: 'Just now'
    },
    {
      id: 'usr-2',
      name: 'Sara Chen',
      email: 'sara@solaria.io',
      level: 'Admin',
      role: 'Operations Director',
      status: 'Active',
      isPrimaryOwner: false,
      lastActive: '12m ago'
    },
    {
      id: 'usr-3',
      name: 'Marcus Vance',
      email: 'marcus@solaria.io',
      level: 'User',
      role: 'Sales Manager',
      status: 'Active',
      isPrimaryOwner: false,
      lastActive: '1h ago'
    },
    {
      id: 'usr-4',
      name: 'Elena Rostova',
      email: 'elena@solaria.io',
      level: 'User',
      role: 'Account Executive',
      status: 'Active',
      isPrimaryOwner: false,
      lastActive: '3h ago'
    }
  ]);

  // Pending Invites Data
  const [pendingInvites, setPendingInvites] = useState([
    {
      id: 'inv-1',
      email: 'liam.thornton@solaria.io',
      level: 'User',
      role: 'Support Specialist',
      sentAt: 'Yesterday',
      expiresIn: '6 days'
    }
  ]);

  // Roles Data
  const [roles, setRoles] = useState([
    {
      id: 'role-owner',
      name: 'Owner',
      description: 'Complete root administrative authority over workspace, billing, and team members.',
      memberCount: 1,
      isSystem: true,
      permissions: [
        'crm.view', 'crm.create', 'crm.edit', 'crm.delete', 'crm.export',
        'crm.values', 'rules.manage', 'integrations.manage', 'audit.view'
      ]
    },
    {
      id: 'role-admin',
      name: 'Admin',
      description: 'Manages team operations, integrations, CRM pipelines, and assignment SLA rules.',
      memberCount: 1,
      isSystem: true,
      permissions: [
        'crm.view', 'crm.create', 'crm.edit', 'crm.delete', 'crm.export',
        'crm.values', 'rules.manage', 'integrations.manage', 'audit.view'
      ]
    },
    {
      id: 'role-manager',
      name: 'Sales Manager',
      description: 'Oversees pipeline velocity, views deal opportunity numbers, and manages escalation queues.',
      memberCount: 1,
      isSystem: false,
      permissions: [
        'crm.view', 'crm.create', 'crm.edit', 'crm.export', 'crm.values',
        'rules.manage', 'audit.view'
      ]
    },
    {
      id: 'role-user',
      name: 'Account Executive',
      description: 'Standard operational team member responsible for lead outreach and CRM updates.',
      memberCount: 1,
      isSystem: false,
      permissions: [
        'crm.view', 'crm.create', 'crm.edit'
      ]
    }
  ]);

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    level: 'User',
    role: 'Account Executive'
  });

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    description: '',
    permissions: ['crm.view', 'crm.create']
  });

  const [userToDelete, setUserToDelete] = useState(null);

  // Invite Member handler
  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    const newInvite = {
      id: `inv-${Date.now()}`,
      email: inviteForm.email,
      level: inviteForm.level,
      role: inviteForm.role,
      sentAt: 'Just now',
      expiresIn: '7 days'
    };
    setPendingInvites((prev) => [...prev, newInvite]);
    setShowInviteModal(false);
    setInviteForm({ email: '', level: 'User', role: 'Account Executive' });
    addToast(`Invitation sent to ${newInvite.email}`, 'success');
  };

  const handleRevokeInvite = (id) => {
    setPendingInvites((prev) => prev.filter((inv) => inv.id !== id));
    addToast('Invitation revoked.', 'info');
  };

  const handleResendInvite = (email) => {
    addToast(`Invitation resent to ${email}`, 'success');
  };

  // Remove Member handler
  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    // Rule: Cannot delete Owner
    if (userToDelete.isPrimaryOwner || userToDelete.level === 'Owner') {
      addToast('Primary Owner row is locked and cannot be removed (F1.2).', 'error');
      setUserToDelete(null);
      return;
    }

    // Rule: Admin cannot edit/remove Owner
    if (currentUser?.level === 'Admin' && userToDelete.level === 'Owner') {
      addToast('Admins cannot modify or remove Workspace Owners (F1.2).', 'error');
      setUserToDelete(null);
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== userToDelete.id));
    addToast(`Removed ${userToDelete.name} from workspace.`, 'success');
    setUserToDelete(null);
  };

  // Create Role handler
  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) {
      addToast('Please provide a role title.', 'error');
      return;
    }
    const created = {
      id: `role-${Date.now()}`,
      name: newRoleForm.name,
      description: newRoleForm.description || 'Custom workspace role',
      memberCount: 0,
      isSystem: false,
      permissions: newRoleForm.permissions
    };
    setRoles((prev) => [...prev, created]);
    setShowCreateRoleModal(false);
    setNewRoleForm({ name: '', description: '', permissions: ['crm.view', 'crm.create'] });
    addToast(`Role "${created.name}" created successfully!`, 'success');
  };

  const togglePermission = (permKey) => {
    setNewRoleForm((prev) => {
      const perms = prev.permissions.includes(permKey)
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: perms };
    });
  };

  // Permission Matrix Checklist Definition
  const MATRIX_PERMISSIONS = [
    { key: 'crm.view', label: 'CRM View Records', category: 'CRM' },
    { key: 'crm.create', label: 'CRM Create Records', category: 'CRM' },
    { key: 'crm.edit', label: 'CRM Edit Records', category: 'CRM' },
    { key: 'crm.delete', label: 'CRM Delete Records', category: 'CRM' },
    { key: 'crm.export', label: 'CRM Export CSV / Data', category: 'CRM' },
    { key: 'crm.values', label: 'View Opportunity Deal Values', category: 'Opportunity' },
    { key: 'rules.manage', label: 'Manage Assignment & SLA Rules', category: 'Escalation' },
    { key: 'integrations.manage', label: 'Manage Central Integrations Hub', category: 'Integrations' },
    { key: 'audit.view', label: 'View Immutable Audit Trail', category: 'Audit' }
  ];

  const memberColumns = [
    {
      key: 'name',
      label: 'Team Member',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#ebf1f5] text-[#4a6b82] flex items-center justify-center font-bold text-xs">
            {row.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="font-bold text-[#1a1917] flex items-center gap-1.5">
              <span>{row.name}</span>
              {row.isPrimaryOwner && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eaf0ee] text-[#52796f] border border-[#52796f]/20">
                  <Lock size={10} /> Primary Owner
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#79756d]">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'level',
      label: 'Authority Level',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
            val === 'Owner'
              ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30'
              : val === 'Admin'
              ? 'bg-[#ebf1f5] text-[#4a6b82] border-[#4a6b82]/30'
              : 'bg-[#f4f2ee] text-[#79756d] border-[#e8e5de]'
          }`}
        >
          {val}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role Title',
      render: (val) => <span className="font-medium text-[#1a1917]">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-[#52796f] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#52796f]"></span>
          {val}
        </div>
      )
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      render: (val) => <span className="text-[#79756d]">{val}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => {
        // Enforce rule: Admin cannot edit Owner, Owner is locked
        const isLocked = row.isPrimaryOwner || (currentUser?.level === 'Admin' && row.level === 'Owner');

        return (
          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="text-[11px] text-[#a8a49c] italic flex items-center gap-1">
                <Lock size={11} /> Locked
              </span>
            ) : (
              <button
                onClick={() => setUserToDelete(row)}
                title="Remove Member"
                className="p-1 rounded text-[#79756d] hover:text-[#c26751] hover:bg-[#faece8] transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1917] tracking-tight">Team, Roles & Access Control</h1>
          <p className="text-xs text-[#79756d] mt-0.5">
            Manage authorized staff members, role hierarchies, and granular permission boundaries (F1.2, F1.3)
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#f4f2ee] p-1 border border-[#e8e5de] rounded-lg">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'members'
                ? 'bg-white text-[#1a1917] shadow-xs'
                : 'text-[#79756d] hover:text-[#1a1917]'
            }`}
          >
            <Users size={14} /> Members & Invites ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'roles'
                ? 'bg-white text-[#1a1917] shadow-xs'
                : 'text-[#79756d] hover:text-[#1a1917]'
            }`}
          >
            <Shield size={14} /> Roles & Permissions ({roles.length})
          </button>
        </div>
      </div>

      {/* Security Governance Notice */}
      <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-lg flex items-center justify-between text-xs text-[#79756d]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#52796f]" />
          <span>
            <strong>RBAC Security Active:</strong> Primary Workspace Owner row is immutable. Admins cannot edit or remove Owners.
          </span>
        </div>
        <span className="text-[11px] text-[#a8a49c]">Tenant #WS-104</span>
      </div>

      {/* Tab 1: Members & Pending Invites */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1a1917]">Active Workspace Members</h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1917] hover:bg-[#33302a] text-white text-xs font-semibold rounded-md transition-all shadow-xs cursor-pointer"
            >
              <UserPlus size={14} /> Invite New Member
            </button>
          </div>

          <DataTable
            columns={memberColumns}
            data={members}
            searchPlaceholder="Search members by name or email..."
            searchKeys={['name', 'email', 'level', 'role']}
            pageSize={10}
          />

          {/* Pending Invites Section */}
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5">
            <h3 className="text-sm font-bold text-[#1a1917] mb-1">Pending Invitations ({pendingInvites.length})</h3>
            <p className="text-xs text-[#79756d] mb-4">
              Invites remain active for 7 days. Once accepted, invited users inherit the specified role.
            </p>

            {pendingInvites.length === 0 ? (
              <div className="text-xs text-[#79756d] italic py-2">No pending invitations.</div>
            ) : (
              <div className="divide-y divide-[#e8e5de]">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-[#f4f2ee] text-[#79756d] flex items-center justify-center">
                        <Mail size={13} />
                      </div>
                      <div>
                        <div className="font-bold text-[#1a1917]">{inv.email}</div>
                        <div className="text-[11px] text-[#79756d]">
                          Role: <span className="font-semibold">{inv.role}</span> ({inv.level}) • Sent {inv.sentAt} • Expires in {inv.expiresIn}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendInvite(inv.email)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#1a1917] border border-[#d3cfc7] rounded hover:bg-[#f4f2ee] transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} /> Resend
                      </button>
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="px-2.5 py-1 text-xs text-[#c26751] border border-[#c26751]/30 rounded hover:bg-[#faece8] transition-colors cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Roles and Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1a1917]">Configured Workspace Roles</h2>
              <p className="text-xs text-[#79756d]">
                Define permissions across CRM, Assignment SLA, Integrations, and Audit history.
              </p>
            </div>
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1917] hover:bg-[#33302a] text-white text-xs font-semibold rounded-md transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Create Custom Role
            </button>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="bg-white border border-[#e8e5de] rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1a1917]">{r.name}</h3>
                      {r.isSystem && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#f4f2ee] text-[#79756d]">
                          System Role
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#52796f] bg-[#eaf0ee] px-2 py-0.5 rounded-full">
                      {r.memberCount} {r.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <p className="text-xs text-[#79756d] mb-4 leading-relaxed">{r.description}</p>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-2">
                    Granted Permissions ({r.permissions.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 bg-[#f4f2ee] border border-[#e8e5de] rounded text-[10px] font-mono text-[#3c3933]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comprehensive Permission Matrix Breakdown */}
          <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#faf9f6] border-b border-[#e8e5de]">
              <h3 className="text-xs font-bold text-[#1a1917] uppercase tracking-wider">
                System RBAC Permission Matrix
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f2ee] border-b border-[#e8e5de] text-[#79756d] font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Permission Capability</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-center">Owner</th>
                    <th className="px-4 py-2.5 text-center">Admin</th>
                    <th className="px-4 py-2.5 text-center">Manager</th>
                    <th className="px-4 py-2.5 text-center">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e5de]">
                  {MATRIX_PERMISSIONS.map((mp) => (
                    <tr key={mp.key} className="hover:bg-[#faf9f6]/70">
                      <td className="px-4 py-2.5 font-medium text-[#1a1917]">{mp.label}</td>
                      <td className="px-4 py-2.5 text-[#79756d]">{mp.category}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Check size={14} className="text-[#52796f] mx-auto font-bold" />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Check size={14} className="text-[#52796f] mx-auto font-bold" />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {['crm.view', 'crm.create', 'crm.edit', 'crm.export', 'crm.values', 'rules.manage', 'audit.view'].includes(mp.key) ? (
                          <Check size={14} className="text-[#52796f] mx-auto font-bold" />
                        ) : (
                          <span className="text-[#a8a49c]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {['crm.view', 'crm.create', 'crm.edit'].includes(mp.key) ? (
                          <Check size={14} className="text-[#52796f] mx-auto font-bold" />
                        ) : (
                          <span className="text-[#a8a49c]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#e8e5de] rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-[#1a1917] mb-1">Invite Workspace Member</h3>
            <p className="text-xs text-[#79756d] mb-4">
              Send an email invitation. They will be granted immediate access upon confirming their account.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Member Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@solaria.io"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Authority Level</label>
                <select
                  value={inviteForm.level}
                  onChange={(e) => setInviteForm({ ...inviteForm, level: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none"
                >
                  <option value="User">User (Standard operational rights)</option>
                  <option value="Admin">Admin (Full operations and member rights)</option>
                </select>
                <p className="text-[10px] text-[#a8a49c] mt-1">Note: Workspace Owner level cannot be assigned via invitation.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Assigned Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none"
                >
                  <option value="Account Executive">Account Executive</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Operations Director">Operations Director</option>
                  <option value="Support Specialist">Support Specialist</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e5de]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#1a1917] bg-white border border-[#d3cfc7] rounded-md hover:bg-[#f4f2ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a1917] hover:bg-[#33302a] rounded-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#e8e5de] rounded-xl max-w-lg w-full p-6 shadow-xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1a1917] mb-1">Create Custom Role</h3>
            <p className="text-xs text-[#79756d] mb-4">
              Configure fine-grained permissions for this role.
            </p>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Role Title</label>
                <input
                  type="text"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  placeholder="e.g. Regional Lead Coordinator"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Description</label>
                <textarea
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  placeholder="Describe responsibilities and scope"
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-2">
                  Select Permitted Capabilities:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
                  {MATRIX_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 text-xs cursor-pointer select-none p-1.5 hover:bg-white rounded"
                    >
                      <input
                        type="checkbox"
                        checked={newRoleForm.permissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="rounded border-[#d3cfc7] text-[#1a1917]"
                      />
                      <span className="text-[#1a1917] font-medium">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e5de]">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#1a1917] bg-white border border-[#d3cfc7] rounded-md hover:bg-[#f4f2ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a1917] hover:bg-[#33302a] rounded-md"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove User Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${userToDelete?.name} (${userToDelete?.email})? They will lose access to the workspace immediately.`}
        confirmLabel="Remove Member"
        isDanger={true}
        onConfirm={confirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
