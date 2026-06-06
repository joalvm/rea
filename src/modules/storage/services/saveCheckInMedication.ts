import * as SQLite from "expo-sqlite";

import { DailyLog } from "@/types/records.types";

import createUuidV7 from "../utils/createUuidV7";
import { mapMedicationRelief } from "./checkInFieldMappers";

/** Guarda medicacion observada de un check-in reutilizando catalogo activo por nombre. */
export default async function saveCheckInMedication(
    transaction: SQLite.SQLiteDatabase,
    userId: string,
    checkInId: string,
    recordedAt: string,
    dailyLog: DailyLog | undefined,
    now: string,
) {
    const name = dailyLog?.details?.medicationName?.trim();
    if (!name) {
        await transaction.runAsync(
            "UPDATE checkin_medications SET deleted_at = ?, updated_at = ? WHERE checkin_id = ?",
            now,
            now,
            checkInId,
        );
        return;
    }

    const medicationId = createUuidV7();
    const normalizedName = name.toLocaleLowerCase("es").normalize("NFKC");
    await transaction.runAsync(
        `INSERT INTO medication_catalog (
            id,
            user_id,
            name,
            normalized_name,
            created_at,
            updated_at,
            version
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(user_id, normalized_name) WHERE deleted_at IS NULL DO UPDATE SET
            name = excluded.name,
            updated_at = excluded.updated_at,
            version = medication_catalog.version + 1`,
        medicationId,
        userId,
        name,
        normalizedName,
        now,
        now,
    );
    const medication = await transaction.getFirstAsync<{ id: string }>(
        "SELECT id FROM medication_catalog WHERE user_id = ? AND normalized_name = ? AND deleted_at IS NULL",
        userId,
        normalizedName,
    );

    await transaction.runAsync(
        "UPDATE checkin_medications SET deleted_at = ?, updated_at = ? WHERE checkin_id = ?",
        now,
        now,
        checkInId,
    );
    await transaction.runAsync(
        `INSERT INTO checkin_medications (
            id,
            checkin_id,
            medication_id,
            taken_at,
            relief,
            dose_note,
            created_at,
            updated_at,
            version
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, 1)`,
        createUuidV7(),
        checkInId,
        medication?.id ?? medicationId,
        recordedAt,
        mapMedicationRelief(dailyLog?.details?.medicationRelief ?? "not_applicable"),
        now,
        now,
    );
}
