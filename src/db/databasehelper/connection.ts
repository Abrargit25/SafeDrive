import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { CREATE_TABLES_SQL, DATABASE_NAME } from './schema';

let database: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (database) return database;
  if (!initPromise) {
    initPromise = openAndMigrate();
  }
  database = await initPromise;
  return database;
}

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(CREATE_TABLES_SQL);
  return db;
}

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const db = await getDatabase();
  await db.execAsync('BEGIN IMMEDIATE;');
  try {
    const result = await fn();
    await db.execAsync('COMMIT;');
    return result;
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}
