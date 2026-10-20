import { drizzle } from 'drizzle-orm/expo-sqlite';
// SDK 51 ships the synchronous API under `expo-sqlite/next` (it became the default in SDK 52).
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite/next';
import * as schema from './schema';
import { MIGRATIONS } from './migrations';

let sqliteInstance: SQLiteDatabase | null = null;
let dbInstance: ReturnType<typeof createDrizzle> | null = null;

function createDrizzle(sqlite: SQLiteDatabase) {
  return drizzle(sqlite, { schema });
}

/** Applies any migrations newer than the DB's `user_version`. Safe to call repeatedly. */
function migrate(sqlite: SQLiteDatabase): void {
  const row = sqlite.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let version = current; version < MIGRATIONS.length; version++) {
    sqlite.withTransactionSync(() => {
      sqlite.execSync(MIGRATIONS[version]);
      // PRAGMA does not accept bound parameters; `version` is a trusted integer.
      sqlite.execSync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

export function getDatabase() {
  if (!dbInstance) {
    sqliteInstance = openDatabaseSync('openplayer.db');
    sqliteInstance.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `);
    migrate(sqliteInstance);
    dbInstance = createDrizzle(sqliteInstance);
  }
  return dbInstance;
}

export const db = getDatabase();

export type Database = typeof db;

export { schema };
export * from './schema';
