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
        "INSERT INTO cycles (startDate, endDate, predicted, createdAt) VALUES (?, ?, ?, ?)",
        cycle.startDate,
        cycle.endDate ?? null,
        cycle.predicted ? 1 : 0,
        cycle.createdAt,
    );
}

export async function loadCycles(): Promise<Cycle[]> {
    const rows = await db().getAllAsync<{
        id: number;
        startDate: string;
        endDate: string | null;
        predicted: number;
        createdAt: string;
    }>("SELECT * FROM cycles ORDER BY startDate DESC");

    return rows.map((row) => ({
        id: row.id,
        startDate: row.startDate,
        endDate: row.endDate,
        predicted: row.predicted === 1,
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
        "INSERT OR REPLACE INTO daily_logs (date, bleedingLevel, symptoms, notes, updatedAt) VALUES (?, ?, ?, ?, ?)",
        log.date,
        log.bleedingLevel,
        JSON.stringify(log.symptoms),
        log.notes ?? null,
        log.updatedAt,
    );
}

export async function loadDailyLogs(): Promise<DailyLog[]> {
    const rows = await db().getAllAsync<{
        date: string;
        bleedingLevel: DailyLog["bleedingLevel"];
        symptoms: string;
        notes: string | null;
        updatedAt: string;
    }>("SELECT * FROM daily_logs ORDER BY date DESC LIMIT 200");

    return rows.map((row) => ({
        date: row.date,
        bleedingLevel: row.bleedingLevel,
        symptoms: JSON.parse(row.symptoms) as string[],
        notes: row.notes,
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
