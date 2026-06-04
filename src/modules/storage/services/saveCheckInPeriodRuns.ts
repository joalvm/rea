import * as SQLite from "expo-sqlite";

import { DailyLog } from "@/types/records.types";

import createUuidV7 from "../utils/createUuidV7";
import { mapBleedingIntensity } from "./checkInFieldMappers";

/** Actualiza bloques de periodo desde señales observadas; confirmacion de usuaria manda sobre inferencia. */
export default async function saveCheckInPeriodRuns(
    transaction: SQLite.SQLiteDatabase,
    userId: string,
    localDate: string,
    dailyLog: DailyLog | undefined,
    now: string,
) {
    if (!dailyLog) {
        return;
    }

    if (dailyLog.details?.periodStarted || mapBleedingIntensity(dailyLog.bleedingLevel) >= 2) {
        await transaction.runAsync(
            `INSERT INTO period_runs (
                id,
                user_id,
                start_date,
                end_date,
                status,
                source,
                created_at,
                updated_at,
                version
            ) VALUES (?, ?, ?, NULL, 'open', ?, ?, ?, 1)
            ON CONFLICT(user_id, start_date) WHERE deleted_at IS NULL DO UPDATE SET
                source = CASE
                    WHEN period_runs.source = 'user_confirmed' OR excluded.source = 'user_confirmed' THEN 'user_confirmed'
                    ELSE 'bleeding_inferred'
                END,
                updated_at = excluded.updated_at,
                version = period_runs.version + 1`,
            createUuidV7(),
            userId,
            localDate,
            dailyLog.details?.periodStarted ? "user_confirmed" : "bleeding_inferred",
            now,
            now,
        );
    }

    if (!dailyLog.details?.periodEnded) {
        return;
    }

    await transaction.runAsync(
        `UPDATE period_runs
         SET end_date = ?,
             status = 'closed',
             updated_at = ?,
             version = version + 1
         WHERE id = (
            SELECT id
            FROM period_runs
            WHERE user_id = ?
              AND deleted_at IS NULL
              AND start_date <= ?
              AND (end_date IS NULL OR end_date <= ?)
            ORDER BY start_date DESC
            LIMIT 1
         )`,
        localDate,
        now,
        userId,
        localDate,
        localDate,
    );
}
