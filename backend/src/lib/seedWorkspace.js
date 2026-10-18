import { findUserByEmail } from './store.js';
import { addMemberIfAbsent, ensureWorkspaceForUser } from './context.js';
import { db } from './db.js';
import { getSettings, saveSettings } from './settings.js';

const DEMO_MEMBERS = [
  { email: 'owner@omniflow.io', level: 'owner', backup: false },
  { email: 'admin@omniflow.io', level: 'admin', backup: true },
  { email: 'marcus@omniflow.io', level: 'user', backup: false },
  { email: 'jordan@omniflow.io', level: 'user', backup: false },
];

export async function seedDemoWorkspace() {
  const owner = await findUserByEmail('owner@omniflow.io');
  if (!owner) return null;

  const { workspace } = await ensureWorkspaceForUser(owner, { workspaceName: 'Solaria Energy Systems' });

  await db.collection('workspaces').mutate((rows) => {
    const row = rows.find((entry) => entry.id === workspace.id);
    if (row && row.name !== 'Solaria Energy Systems') row.name = 'Solaria Energy Systems';
  });

  let added = 0;
  for (const definition of DEMO_MEMBERS) {
    const user = await findUserByEmail(definition.email);
    if (!user) continue;

    const before = await db
      .collection('members')
      .find((member) => member.userId === user.id && member.workspaceId === workspace.id);

    await addMemberIfAbsent({
      workspaceId: workspace.id,
      user,
      level: definition.level,
      backup: definition.backup,
    });

    if (!before) added += 1;
  }

  const existingSettings = await db
    .collection('workspace-settings')
    .find((row) => row.workspaceId === workspace.id);

  if (!existingSettings) {
    await saveSettings(workspace.id, {
      acknowledgeSeconds: 45, // 45 seconds for demo observation
      publicIntake: true,
      maxOpenLeads: 5,
      escalation: [
        { afterSeconds: 30, to: 'next' },
        { afterSeconds: 60, to: 'backup' },
        { afterSeconds: 120, to: 'manager' },
      ],
    });
  }

  return {
    workspace,
    members: added,
    acknowledgeSeconds: 45,
  };
}
