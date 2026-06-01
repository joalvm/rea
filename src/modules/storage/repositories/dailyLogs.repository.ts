import { DailyLog } from "@/types/records.types";
import { normalizeSymptomKey, normalizeSymptomKeys } from "@/modules/cycle/utils/symptomCatalog";

import db from "../core/database";

/** Inserta o actualiza registro diario consolidado. */
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

/** Elimina registro diario por fecha exacta. */
export async function deleteDailyLog(date: string) {
    await db().runAsync("DELETE FROM daily_logs WHERE date = ?", date);
}

/** Carga últimos registros diarios visibles en app. */
export async function loadDailyLogs(): Promise<DailyLog[]> {
    return loadDailyLogsFromQuery("SELECT * FROM daily_logs ORDER BY date DESC LIMIT 200");
}

/** Carga historial completo de registros diarios para servicios internos. */
export async function loadAllDailyLogs(): Promise<DailyLog[]> {
    return loadDailyLogsFromQuery("SELECT * FROM daily_logs ORDER BY date ASC");
}

/** Ejecuta query de logs y normaliza campos serializados. */
async function loadDailyLogsFromQuery(query: string): Promise<DailyLog[]> {
    const rows = await db().getAllAsync<{
        date: string;
        bleedingLevel: DailyLog["bleedingLevel"];
        symptoms: string;
        notes: string | null;
        source: NonNullable<DailyLog["source"]>;
        details: string | null;
        updatedAt: string;
    }>(query);

    return rows.map((row) => {
        const details = row.details
            ? normalizeDailyLogDetails(JSON.parse(row.details) as NonNullable<DailyLog["details"]>)
            : null;

        return {
            date: row.date,
            bleedingLevel: row.bleedingLevel,
            symptoms: normalizeSymptomKeys(JSON.parse(row.symptoms) as string[]),
            notes: row.notes,
            source: row.source ?? "observed",
            details,
            updatedAt: row.updatedAt,
        };
    });
}

function normalizeDailyLogDetails(details: NonNullable<DailyLog["details"]>): NonNullable<DailyLog["details"]> {
    const symptomIntensities = Object.entries(details.symptomIntensities ?? {}).reduce<
        Partial<Record<DailyLog["symptoms"][number], number>>
    >((accumulator, [key, value]) => {
        const normalized = normalizeSymptomKey(key);
        if (!normalized || typeof value !== "number") {
            return accumulator;
        }

        accumulator[normalized] = value;
        return accumulator;
    }, {});
    const hasSymptomIntensities = Object.keys(symptomIntensities).length > 0;

    return {
        ...details,
        pmsState: details.pmsState ?? (details.pmsStarted ? "starting" : undefined),
        symptomIntensities: hasSymptomIntensities ? symptomIntensities : undefined,
        painLocations: details.painLocations ?? [],
    };
}
