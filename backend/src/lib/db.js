import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const here = dirname(fileURLToPath(import.meta.url));
export const dataDir = join(here, '..', '..', 'data');

export function sanitizeMongoUri(raw) {
  let uri = String(raw || '').trim();
  uri = uri.replace(/^(MONGODB_URI|MONGO_URI)\s*=\s*/i, '').trim();
  uri = uri.replace(/^['"]|['"]$/g, '').trim();
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    return 'mongodb://127.0.0.1:27017/omniflow';
  }
  return uri;
}

const MONGODB_URI = sanitizeMongoUri(process.env.MONGODB_URI || process.env.MONGO_URI);

let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;

// Attempt MongoDB connection asynchronously
export async function initMongo() {
  if (mongoDb) return mongoDb;
  try {
    const cleanUri = sanitizeMongoUri(process.env.MONGODB_URI || process.env.MONGO_URI);
    mongoClient = new MongoClient(cleanUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isMongoConnected = true;
    console.log(`[db] Connected to MongoDB database: ${mongoDb.databaseName}`);
    import('../models/schemas.js')
      .then(({ ensureIndexes }) => ensureIndexes(mongoDb))
      .catch(() => {});
    return mongoDb;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[db] MongoDB not reachable at ${MONGODB_URI}. Falling back to file-backed JSON store: ${err.message}`);
    return null;
  }
}

// Kick off connection immediately
initMongo().catch(() => {});

/**
 * Universal collection abstraction supporting both MongoDB and Atomic File Storage.
 * Allows existing business logic (leads, members, settings, audit) to run with 100% fidelity.
 */
export function collection(name) {
  const file = join(dataDir, `${name}.json`);
  let queue = Promise.resolve();

  async function readJsonRows() {
    try {
      const raw = await readFile(file, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async function writeJsonRows(rows) {
    await mkdir(dataDir, { recursive: true });
    const tmp = join(dataDir, `.${name}.${randomUUID()}.tmp`);
    await writeFile(tmp, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    await rename(tmp, file);
  }

  function withLock(task) {
    const run = queue.then(task, task);
    queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  return {
    name,

    read: async () => {
      if (isMongoConnected && mongoDb) {
        try {
          const docs = await mongoDb.collection(name).find({}).toArray();
          return docs.map((doc) => {
            const { _id, ...rest } = doc;
            return { id: doc.id || String(_id), ...rest };
          });
        } catch {
          // Fallback to json if query fails
        }
      }
      return readJsonRows();
    },

    find: async (predicateOrQuery) => {
      if (isMongoConnected && mongoDb && typeof predicateOrQuery === 'object' && predicateOrQuery !== null) {
        try {
          const doc = await mongoDb.collection(name).findOne(predicateOrQuery);
          if (doc) {
            const { _id, ...rest } = doc;
            return { id: doc.id || String(_id), ...rest };
          }
          return null;
        } catch {}
      }
      const rows = isMongoConnected && mongoDb ? await mongoDb.collection(name).find({}).toArray() : await readJsonRows();
      if (typeof predicateOrQuery === 'function') {
        return rows.find(predicateOrQuery) ?? null;
      }
      return rows.find((r) => Object.entries(predicateOrQuery).every(([k, v]) => r[k] === v)) ?? null;
    },

    where: async (predicateOrQuery) => {
      if (isMongoConnected && mongoDb && typeof predicateOrQuery === 'object' && predicateOrQuery !== null) {
        try {
          const docs = await mongoDb.collection(name).find(predicateOrQuery).toArray();
          return docs.map((doc) => {
            const { _id, ...rest } = doc;
            return { id: doc.id || String(_id), ...rest };
          });
        } catch {}
      }
      const rows = isMongoConnected && mongoDb ? await mongoDb.collection(name).find({}).toArray() : await readJsonRows();
      if (typeof predicateOrQuery === 'function') {
        return rows.filter(predicateOrQuery);
      }
      return rows.filter((r) => Object.entries(predicateOrQuery).every(([k, v]) => r[k] === v));
    },

    mutate: (fn) =>
      withLock(async () => {
        let rows = isMongoConnected && mongoDb
          ? (await mongoDb.collection(name).find({}).toArray()).map(({ _id, ...r }) => ({ id: r.id || String(_id), ...r }))
          : await readJsonRows();

        const outcome = await fn(rows);

        if (isMongoConnected && mongoDb) {
          try {
            await mongoDb.collection(name).deleteMany({});
            if (rows.length > 0) {
              await mongoDb.collection(name).insertMany(rows.map((r) => ({ ...r, _id: undefined })));
            }
          } catch (e) {
            console.error(`[db] MongoDB sync error on ${name}:`, e.message);
          }
        }

        await writeJsonRows(rows);
        return outcome;
      }),

    insert: (doc) =>
      withLock(async () => {
        const record = { ...doc, id: doc.id ?? randomUUID() };
        if (isMongoConnected && mongoDb) {
          try {
            await mongoDb.collection(name).insertOne({ ...record });
          } catch {}
        }
        const rows = await readJsonRows();
        rows.push(record);
        await writeJsonRows(rows);
        return record;
      }),
  };
}

export const db = { collection };
export const newId = () => randomUUID();
export const isConnected = () => isMongoConnected;
