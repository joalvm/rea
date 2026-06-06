import { DailyLog, MoodCheckIn, SymptomKey } from "@/types/records.types";

import getDatabase from "../connection";
import createUuidV7 from "../utils/createUuidV7";
import { mapBleedingIntensity, mapClots, mapLibido, mapPainInterference, mapPmsIntensity } from "./checkInFieldMappers";
import { getActiveProfileId } from "./profileState";
import recalculateDailySummary from "./recalculateDailySummary";
import saveCheckInMedication from "./saveCheckInMedication";
import saveCheckInPeriodRuns from "./saveCheckInPeriodRuns";

export interface SaveCheckInInput {
    moodCheckIn?: MoodCheckIn;
    dailyLog?: DailyLog;
}

/** Guarda check-in canonico con sintomas, medicacion y señal de periodo en una transaccion. */
export default async function saveCheckIn({ moodCheckIn, dailyLog }: SaveCheckInInput) {
    const database = await getDatabase();
    const userId = await getActiveProfileId();
    if (!userId) {
        return;
    }

    const now = new Date().toISOString();
    const checkInId = typeof moodCheckIn?.id === "string" ? moodCheckIn.id : createUuidV7();
    const recordedAt = moodCheckIn?.datetime ?? dailyLog?.updatedAt ?? now;
    const localDate = dailyLog?.date ?? recordedAt.slice(0, 10);
    const note = dailyLog?.notes ?? moodCheckIn?.note ?? null;

    await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync(
            `INSERT INTO checkins (
                id,
                user_id,
                recorded_at,
                local_date,
                bleeding_intensity,
                clots,
                mood,
                energy,
                stress_level,
                breast_sensitivity,
                libido,
                pain_intensity,
                pain_interference,
                pms_intensity,
                period_status_signal,
                note,
                created_at,
                updated_at,
                version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id) DO UPDATE SET
                recorded_at = excluded.recorded_at,
                local_date = excluded.local_date,
                bleeding_intensity = excluded.bleeding_intensity,
                clots = excluded.clots,
                mood = excluded.mood,
                energy = excluded.energy,
                stress_level = excluded.stress_level,
                breast_sensitivity = excluded.breast_sensitivity,
                libido = excluded.libido,
                pain_intensity = excluded.pain_intensity,
                pain_interference = excluded.pain_interference,
                pms_intensity = excluded.pms_intensity,
                period_status_signal = excluded.period_status_signal,
                note = excluded.note,
                updated_at = excluded.updated_at,
                deleted_at = NULL,
                version = checkins.version + 1`,
            checkInId,
            userId,
            recordedAt,
            localDate,
            dailyLog ? mapBleedingIntensity(dailyLog.bleedingLevel) : null,
            dailyLog?.details?.clotSize ? mapClots(dailyLog.details.clotSize) : null,
            moodCheckIn?.mood ?? null,
            moodCheckIn?.energy ?? null,
            moodCheckIn?.stress ?? null,
            moodCheckIn?.breastSensitivity ?? dailyLog?.details?.breastSensitivity ?? null,
            dailyLog?.details?.libidoLevel ? mapLibido(dailyLog.details.libidoLevel) : null,
            moodCheckIn?.pain ?? null,
            dailyLog?.details?.painImpact ? mapPainInterference(dailyLog.details.painImpact) : null,
            dailyLog?.details?.pmsState ? mapPmsIntensity(dailyLog.details.pmsState) : null,
            getPeriodStatusSignal(dailyLog),
            note,
            now,
            now,
        );

        await transaction.runAsync(
            "UPDATE checkin_symptoms SET deleted_at = ?, updated_at = ? WHERE checkin_id = ?",
            now,
            now,
            checkInId,
        );
        if (dailyLog) {
            for (const symptom of dailyLog.symptoms) {
                await transaction.runAsync(
                    `INSERT INTO checkin_symptoms (
                        checkin_id,
                        symptom_key,
                        intensity,
                        created_at,
                        updated_at,
                        version
                    ) VALUES (?, ?, ?, ?, ?, 1)
                    ON CONFLICT(checkin_id, symptom_key) DO UPDATE SET
                        intensity = excluded.intensity,
                        updated_at = excluded.updated_at,
                        deleted_at = NULL,
                        version = checkin_symptoms.version + 1`,
                    checkInId,
                    symptom,
                    getSymptomIntensity(symptom, dailyLog),
                    now,
                    now,
                );
            }
        }

        await saveCheckInMedication(transaction, userId, checkInId, recordedAt, dailyLog, now);
        await saveCheckInPeriodRuns(transaction, userId, localDate, dailyLog, now);
    });

    await recalculateDailySummary(localDate);
}

/** Borra logicamente check-in canonico y sus detalles. */
export async function deleteCheckIn(id: string | number) {
    if (typeof id !== "string") {
        return;
    }

    const database = await getDatabase();
    const now = new Date().toISOString();
    const row = await database.getFirstAsync<{ local_date: string }>(
        "SELECT local_date FROM checkins WHERE id = ?",
        id,
    );

    await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync("UPDATE checkins SET deleted_at = ?, updated_at = ? WHERE id = ?", now, now, id);
        await transaction.runAsync(
            "UPDATE checkin_symptoms SET deleted_at = ?, updated_at = ? WHERE checkin_id = ?",
            now,
            now,
            id,
        );
        await transaction.runAsync(
            "UPDATE checkin_medications SET deleted_at = ?, updated_at = ? WHERE checkin_id = ?",
            now,
            now,
            id,
        );
    });

    if (row?.local_date) {
        await recalculateDailySummary(row.local_date);
    }
}

function getSymptomIntensity(symptom: SymptomKey, dailyLog: DailyLog) {
    return dailyLog.details?.symptomIntensities?.[symptom] ?? 3;
}

function getPeriodStatusSignal(dailyLog: DailyLog | undefined) {
    if (dailyLog?.details?.periodStarted) {
        return "started";
    }

    if (dailyLog?.details?.periodEnded) {
        return "ended";
    }

    if (dailyLog && mapBleedingIntensity(dailyLog.bleedingLevel) >= 2) {
        return "ongoing";
    }

    return null;
}
