import { createApp } from './app.js';
import { config } from './config.js';
import { seedDemoAccounts } from './lib/seed.js';
import { seedDemoWorkspace } from './lib/seedWorkspace.js';
import { initMongo } from './lib/db.js';

process.on('unhandledRejection', (reason) => {
  console.error('[unhandled rejection]', reason?.message ?? reason);
});

process.on('uncaughtException', (error) => {
  console.error('[uncaught exception]', error?.message ?? error);
});

// Connect to MongoDB
await initMongo();

// Seed initial demo accounts and workspace
const seeded = await seedDemoAccounts();
if (seeded.length > 0) {
  console.log(`[seed] Seeded ${seeded.length} demo account(s).`);
}

try {
  const demo = await seedDemoWorkspace();
  if (demo) {
    console.log(
      `[workspace] Workspace "${demo.workspace.name}" ready · ${demo.members} member(s) added · ${demo.acknowledgeSeconds}s SLA timer`,
    );
  }
} catch (error) {
  console.error(`[workspace] Seeding error: ${error.message}`);
}

const app = createApp();

app.listen(config.port, () => {
  console.log(`[server] OmniFlow Backend API listening on http://localhost:${config.port} (${config.env})`);
  console.log(`[server] MongoDB endpoint: ${config.mongodb.uri}`);
});
