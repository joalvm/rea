import db from "./database";

/** Inicializa tablas y migraciones mínimas de almacenamiento local. */
export default async function initializeDatabase() {
    const database = db();
    await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NOT NULL,
      endDate TEXT,
      predicted INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'observed',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mood_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime TEXT NOT NULL,
      momentType TEXT NOT NULL,
      mood INTEGER NOT NULL,
      energy INTEGER NOT NULL,
      pain INTEGER NOT NULL,
      breastSensitivity INTEGER NOT NULL DEFAULT 0,
      stress INTEGER NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      date TEXT PRIMARY KEY NOT NULL,
      bleedingLevel TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      notes TEXT,
      source TEXT NOT NULL DEFAULT 'observed',
      details TEXT,
      updatedAt TEXT NOT NULL
    );
  `);
}
