import { hashPassword } from './auth.js';
import { createUser, findUserByEmail } from './store.js';

export const DEMO_ACCOUNTS = [
  { name: 'Alex Mercer (Owner)', email: 'owner@omniflow.io', password: 'Password123!', role: 'owner' },
  { name: 'Elena Rostova (Admin)', email: 'admin@omniflow.io', password: 'Password123!', role: 'admin' },
  { name: 'Marcus Vance (Rep)', email: 'marcus@omniflow.io', password: 'Password123!', role: 'user' },
  { name: 'Jordan Reed (Rep)', email: 'jordan@omniflow.io', password: 'Password123!', role: 'user' },
];

const DEMO_EMAILS = new Set(DEMO_ACCOUNTS.map((account) => account.email.toLowerCase()));
export const DEMO_ACCOUNT_COUNT = DEMO_ACCOUNTS.length;

export function isDemoAccount(email) {
  return DEMO_EMAILS.has(String(email ?? '').trim().toLowerCase());
}

export async function countDemoAccounts() {
  let present = 0;
  for (const account of DEMO_ACCOUNTS) {
    if (await findUserByEmail(account.email)) present += 1;
  }
  return present;
}

export async function seedDemoAccounts() {
  const created = [];
  for (const account of DEMO_ACCOUNTS) {
    const existing = await findUserByEmail(account.email);
    if (existing) continue;

    const passwordHash = await hashPassword(account.password);
    const user = await createUser({
      name: account.name,
      email: account.email,
      passwordHash,
      role: account.role,
    });
    created.push({ email: user.email, role: user.role });
  }
  return created;
}
