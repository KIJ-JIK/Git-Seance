/**
 * lib/mongodb.ts
 * MongoDB Atlas connection and tombstone persistence for the Graveyard Wall.
 */

import { MongoClient, Db, Collection } from 'mongodb';

export interface Tombstone {
  _id?: string;
  session_id: string;
  repo_url: string;
  repo_name: string;
  ghost_name: string;
  ghost_era: string;
  language: string;
  epitaph: string;
  last_commit_date: string;
  created_at: Date;
}

const uri = process.env.MONGODB_URI ?? '';
const DB_NAME = 'git-seance';
const COLLECTION = 'tombstones';

// Global MongoClient singleton (Next.js dev hot reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // MongoDB not configured — no-op mode (graceful degradation)
  clientPromise = Promise.reject(new Error('MONGODB_URI not configured'))
    .catch(() => { /* suppress unhandled rejection at module load */ }) as unknown as Promise<MongoClient>;
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

// In-memory fallback if MongoDB Atlas is not yet connected
const memoryTombstones: Tombstone[] = [
  {
    session_id: 'default-1',
    repo_url: 'https://github.com/nicowillis/jsdom',
    repo_name: 'jsdom-ancient',
    ghost_name: 'Sir Nicholas of the DOM',
    ghost_era: '2010',
    language: 'JavaScript',
    epitaph: 'He parsed the HTML before browsers had souls.',
    last_commit_date: '2011-04-12',
    created_at: new Date(),
  },
  {
    session_id: 'default-2',
    repo_url: 'https://github.com/jashkenas/coffeescript',
    repo_name: 'coffeescript',
    ghost_name: 'Master Jeremy the Concise',
    ghost_era: '2014',
    language: 'CoffeeScript',
    epitaph: 'Golden arrows and existential operators, now asleep beneath ES6.',
    last_commit_date: '2020-01-15',
    created_at: new Date(),
  }
];

async function getCollection(): Promise<Collection<Tombstone> | null> {
  if (!uri) return null;
  try {
    const client = await clientPromise;
    if (!client) return null;
    const db: Db = client.db(DB_NAME);
    return db.collection<Tombstone>(COLLECTION);
  } catch {
    return null;
  }
}

export async function saveTombstone(
  tombstone: Omit<Tombstone, '_id' | 'created_at'>
): Promise<string> {
  const doc: Tombstone = { ...tombstone, created_at: new Date() };
  const col = await getCollection();
  if (!col) {
    memoryTombstones.unshift(doc);
    return 'mem-' + Date.now();
  }
  const result = await col.insertOne(doc);
  return result.insertedId.toString();
}

export async function getTombstones(limit = 24): Promise<Tombstone[]> {
  const col = await getCollection();
  if (!col) {
    return memoryTombstones.slice(0, limit);
  }
  try {
    return await col
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray() as unknown as Tombstone[];
  } catch {
    return memoryTombstones.slice(0, limit);
  }
}
