import db from "./database";
import ensureTableColumn from "./migrations";

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

    CREATE TABLE IF NOT EXISTS notification_moments (
      id TEXT PRIMARY KEY NOT NULL,
      label TEXT NOT NULL,
      time TEXT NOT NULL,
      enabled INTEGER NOT NULL,
      days TEXT NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      notificationIds TEXT NOT NULL
    );
  `);

    await ensureTableColumn(database, "cycles", "source", "TEXT NOT NULL DEFAULT 'observed'");
    await ensureTableColumn(database, "mood_checkins", "breastSensitivity", "INTEGER NOT NULL DEFAULT 0");
    await ensureTableColumn(database, "daily_logs", "source", "TEXT NOT NULL DEFAULT 'observed'");
    await ensureTableColumn(database, "daily_logs", "details", "TEXT");
}
