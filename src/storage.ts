import * as SQLite from "expo-sqlite";

import { AppData, AppSettings, Cycle, DailyLog, MoodCheckIn, NotificationMoment } from "./types";

let database: SQLite.SQLiteDatabase | null = null;

function db() {
    if (!database) {
        database = SQLite.openDatabaseSync("mensu.db");
    }
    return database;
}

export async function initializeDatabase() {
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
    await ensureTableColumn(database, "daily_logs", "source", "TEXT NOT NULL DEFAULT 'observed'");
    await ensureTableColumn(database, "daily_logs", "details", "TEXT");
}

async function ensureTableColumn(
    database: SQLite.SQLiteDatabase,
    tableName: string,
    columnName: string,
    definition: string,
) {
    const columns = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    if (columns.some((column) => column.name === columnName)) return;
    await database.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
}

export async function loadAppData(): Promise<AppData> {
    const [settings, cycles, moodCheckIns, dailyLogs, notificationMoments] = await Promise.all([
        loadSettings(),
        loadCycles(),
        loadMoodCheckIns(),
        loadDailyLogs(),
        loadNotificationMoments(),
    ]);

    return {
        settings,
        cycles,
        moodCheckIns,
        dailyLogs,
        notificationMoments,
    };
}

export async function resetAppData() {
    const database = db();
    await database.withTransactionAsync(async () => {
        await database.runAsync("DELETE FROM notification_moments");
        await database.runAsync("DELETE FROM daily_logs");
        await database.runAsync("DELETE FROM mood_checkins");
        await database.runAsync("DELETE FROM cycles");
        await database.runAsync("DELETE FROM app_settings");
    });
}

export async function loadSettings(): Promise<AppSettings | null> {
    const row = await db().getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = ?", "settings");
    return row ? (JSON.parse(row.value) as AppSettings) : null;
}

export async function saveSettings(settings: AppSettings) {
    await db().runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        "settings",
        JSON.stringify(settings),
    );
}

export async function addCycle(cycle: Cycle) {
    await db().runAsync(
        "INSERT INTO cycles (startDate, endDate, predicted, source, createdAt) VALUES (?, ?, ?, ?, ?)",
        cycle.startDate,
        cycle.endDate ?? null,
        cycle.predicted ? 1 : 0,
        cycle.source ?? (cycle.predicted ? "estimated" : "observed"),
        cycle.createdAt,
    );
}

export async function upsertObservedCycleStart(startDate: string, createdAt: string) {
    const existing = await db().getFirstAsync<{ id: number }>(
        "SELECT id FROM cycles WHERE startDate = ? ORDER BY id DESC LIMIT 1",
        startDate,
    );

    if (existing) {
        await db().runAsync("UPDATE cycles SET predicted = 0, source = 'observed' WHERE id = ?", existing.id);
        return;
    }

    await addCycle({
        startDate,
        endDate: null,
        predicted: false,
        source: "observed",
        createdAt,
    });
}

export async function closeLatestObservedCycle(endDate: string) {
    const existing = await db().getFirstAsync<{ id: number; endDate: string | null }>(
        "SELECT id, endDate FROM cycles WHERE startDate <= ? ORDER BY startDate DESC, id DESC LIMIT 1",
        endDate,
    );

    if (!existing) return;
    if (existing.endDate && existing.endDate >= endDate) return;

    await db().runAsync(
        "UPDATE cycles SET endDate = ?, predicted = 0, source = 'observed' WHERE id = ?",
        endDate,
        existing.id,
    );
}

export async function loadCycles(): Promise<Cycle[]> {
    const rows = await db().getAllAsync<{
        id: number;
        startDate: string;
        endDate: string | null;
        predicted: number;
        source: Cycle["source"];
        createdAt: string;
    }>("SELECT * FROM cycles ORDER BY startDate DESC");

    return rows.map((row) => ({
        id: row.id,
        startDate: row.startDate,
        endDate: row.endDate,
        predicted: row.predicted === 1,
        source: row.source ?? (row.predicted === 1 ? "estimated" : "observed"),
        createdAt: row.createdAt,
    }));
}

export async function addMoodCheckIn(checkIn: MoodCheckIn) {
    await db().runAsync(
        "INSERT INTO mood_checkins (datetime, momentType, mood, energy, pain, stress, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
        checkIn.datetime,
        checkIn.momentType,
        checkIn.mood,
        checkIn.energy,
        checkIn.pain,
        checkIn.stress,
        checkIn.note ?? null,
    );
}

export async function loadMoodCheckIns(): Promise<MoodCheckIn[]> {
    return db().getAllAsync<MoodCheckIn>("SELECT * FROM mood_checkins ORDER BY datetime DESC LIMIT 200");
}

export async function upsertDailyLog(log: DailyLog) {
    await db().runAsync(
        "INSERT OR REPLACE INTO daily_logs (date, bleedingLevel, symptoms, notes, source, details, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        log.date,
        log.bleedingLevel,
        JSON.stringify(log.symptoms),
        log.notes ?? null,
        log.source ?? "observed",
        log.details ? JSON.stringify(log.details) : null,
        log.updatedAt,
    );
}

export async function loadDailyLogs(): Promise<DailyLog[]> {
    const rows = await db().getAllAsync<{
        date: string;
        bleedingLevel: DailyLog["bleedingLevel"];
        symptoms: string;
        notes: string | null;
        source: NonNullable<DailyLog["source"]>;
        details: string | null;
        updatedAt: string;
    }>("SELECT * FROM daily_logs ORDER BY date DESC LIMIT 200");

    return rows.map((row) => ({
        date: row.date,
        bleedingLevel: row.bleedingLevel,
        symptoms: JSON.parse(row.symptoms) as string[],
        notes: row.notes,
        source: row.source ?? "observed",
        details: row.details ? (JSON.parse(row.details) as NonNullable<DailyLog["details"]>) : null,
        updatedAt: row.updatedAt,
    }));
}

export async function saveNotificationMoments(moments: NotificationMoment[]) {
    const database = db();
    await database.withTransactionAsync(async () => {
        await database.runAsync("DELETE FROM notification_moments");
        for (const moment of moments) {
            await database.runAsync(
                "INSERT INTO notification_moments (id, label, time, enabled, days, type, question, notificationIds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                moment.id,
                moment.label,
                moment.time,
                moment.enabled ? 1 : 0,
                JSON.stringify(moment.days),
                moment.type,
                moment.question,
                JSON.stringify(moment.notificationIds ?? []),
            );
        }
    });
}

export async function loadNotificationMoments(): Promise<NotificationMoment[]> {
    const rows = await db().getAllAsync<{
        id: string;
        label: string;
        time: string;
        enabled: number;
        days: string;
        type: NotificationMoment["type"];
        question: string;
        notificationIds: string;
    }>("SELECT * FROM notification_moments ORDER BY time ASC");

    return rows.map((row) => ({
        id: row.id,
        label: row.label,
        time: row.time,
        enabled: row.enabled === 1,
        days: JSON.parse(row.days) as number[],
        type: row.type,
        question: row.question,
        notificationIds: JSON.parse(row.notificationIds) as string[],
    }));
}
