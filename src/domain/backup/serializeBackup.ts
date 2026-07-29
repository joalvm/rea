import { DATABASE_VERSION } from "@/db/config";
import type { Database } from "@/db/client";
import { appSettings } from "@/db/schema/appSettings";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { contentDeliveryLog } from "@/db/schema/contentDeliveryLog";
import { contentItem } from "@/db/schema/contentItem";
import { contentRule } from "@/db/schema/contentRule";
import { contentSource } from "@/db/schema/contentSource";
import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { cycleRecord } from "@/db/schema/cycleRecord";
import { dailySummary } from "@/db/schema/dailySummary";
import { intercourseLog } from "@/db/schema/intercourseLog";
import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { periodRun } from "@/db/schema/periodRun";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { profile } from "@/db/schema/profile";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { schemaMigration } from "@/db/schema/schemaMigration";
import { symptomCatalog } from "@/db/schema/symptomCatalog";
import { recalculateInTransaction } from "@/domain/engine/recalculate";
import type { CycleEngineTransaction } from "@/domain/engine/types/CycleEngineTransaction";

export const BACKUP_FORMAT = "rea-backup" as const;

export type BackupTables = {
    appSettings: readonly unknown[];
    checkinMedication: readonly unknown[];
    checkinSymptom: readonly unknown[];
    checkins: readonly unknown[];
    contentDeliveryLog: readonly unknown[];
    contentItems: readonly unknown[];
    contentRules: readonly unknown[];
    contentSources: readonly unknown[];
    cyclePredictions: readonly unknown[];
    cycleRecords: readonly unknown[];
    dailySummaries: readonly unknown[];
    intercourseLog: readonly unknown[];
    medicationCatalog: readonly unknown[];
    periodRuns: readonly unknown[];
    pregnancyEpisodes: readonly unknown[];
    profiles: readonly unknown[];
    reproductiveIntentHistory: readonly unknown[];
    schemaMigrations: readonly unknown[];
    symptomCatalog: readonly unknown[];
};

export type ReaBackup = {
    format: typeof BACKUP_FORMAT;
    schemaVersion: number;
    exportedAt: string;
    tables: BackupTables;
};

/** Serializa todas las tablas locales relevantes en un formato versionado y reemplazable. */
export async function serializeBackup(database: Database): Promise<ReaBackup> {
    const [
        profiles,
        settings,
        intents,
        periods,
        pregnancies,
        symptoms,
        medications,
        checkins,
        checkinSymptoms,
        checkinMedications,
        intercourse,
        summaries,
        predictions,
        cycleRecords,
        sources,
        items,
        rules,
        deliveries,
        migrations,
    ] = await Promise.all([
        database.select().from(profile),
        database.select().from(appSettings),
        database.select().from(reproductiveIntentHistory),
        database.select().from(periodRun),
        database.select().from(pregnancyEpisode),
        database.select().from(symptomCatalog),
        database.select().from(medicationCatalog),
        database.select().from(checkin),
        database.select().from(checkinSymptom),
        database.select().from(checkinMedication),
        database.select().from(intercourseLog),
        database.select().from(dailySummary),
        database.select().from(cyclePrediction),
        database.select().from(cycleRecord),
        database.select().from(contentSource),
        database.select().from(contentItem),
        database.select().from(contentRule),
        database.select().from(contentDeliveryLog),
        database.select().from(schemaMigration),
    ]);

    return {
        format: BACKUP_FORMAT,
        schemaVersion: DATABASE_VERSION,
        exportedAt: new Date().toISOString(),
        tables: {
            profiles,
            appSettings: settings,
            reproductiveIntentHistory: intents,
            periodRuns: periods,
            pregnancyEpisodes: pregnancies,
            symptomCatalog: symptoms,
            medicationCatalog: medications,
            checkins,
            checkinSymptom: checkinSymptoms,
            checkinMedication: checkinMedications,
            intercourseLog: intercourse,
            dailySummaries: summaries,
            cyclePredictions: predictions,
            cycleRecords,
            contentSources: sources,
            contentItems: items,
            contentRules: rules,
            contentDeliveryLog: deliveries,
            schemaMigrations: migrations,
        },
    };
}

/** Valida el envoltorio mínimo antes de permitir un reemplazo total de la base local. */
export function parseBackup(value: unknown): ReaBackup {
    if (!isRecord(value)) {
        throw new Error("El archivo no es un backup válido de Rea.");
    }
    if (value.format !== BACKUP_FORMAT || typeof value.schemaVersion !== "number" || !isRecord(value.tables)) {
        throw new Error("El archivo no es un backup válido de Rea.");
    }
    const tables = value.tables;
    const tableNames = Object.keys(emptyBackupTables());
    if (tableNames.some((name) => !Array.isArray(tables[name]))) {
        throw new Error("El backup está incompleto o corrupto.");
    }
    if (value.schemaVersion !== DATABASE_VERSION) {
        throw new Error(`El backup usa el esquema ${value.schemaVersion}; la app requiere ${DATABASE_VERSION}.`);
    }
    return value as unknown as ReaBackup;
}

/** Restaura por reemplazo total, respetando dependencias y sin mezclar dos backups. */
export async function restoreBackup(database: Database, backup: ReaBackup): Promise<void> {
    await database.transaction(async (tx) => {
        await tx.delete(contentDeliveryLog);
        await tx.delete(dailySummary);
        await tx.delete(cyclePrediction);
        await tx.delete(cycleRecord);
        await tx.delete(checkinSymptom);
        await tx.delete(checkinMedication);
        await tx.delete(intercourseLog);
        await tx.delete(checkin);
        await tx.delete(pregnancyEpisode);
        await tx.delete(periodRun);
        await tx.delete(reproductiveIntentHistory);
        await tx.delete(contentRule);
        await tx.delete(contentItem);
        await tx.delete(contentSource);
        await tx.delete(medicationCatalog);
        await tx.delete(symptomCatalog);
        await tx.delete(appSettings);
        await tx.delete(schemaMigration);
        await tx.delete(profile);

        const tables = backup.tables;
        if (tables.profiles.length) await tx.insert(profile).values(tables.profiles as never);
        if (tables.appSettings.length) await tx.insert(appSettings).values(tables.appSettings as never);
        if (tables.reproductiveIntentHistory.length)
            await tx.insert(reproductiveIntentHistory).values(tables.reproductiveIntentHistory as never);
        if (tables.periodRuns.length) await tx.insert(periodRun).values(tables.periodRuns as never);
        if (tables.pregnancyEpisodes.length)
            await tx.insert(pregnancyEpisode).values(tables.pregnancyEpisodes as never);
        if (tables.symptomCatalog.length) await tx.insert(symptomCatalog).values(tables.symptomCatalog as never);
        if (tables.medicationCatalog.length)
            await tx.insert(medicationCatalog).values(tables.medicationCatalog as never);
        if (tables.checkins.length) await tx.insert(checkin).values(tables.checkins as never);
        if (tables.checkinSymptom.length) await tx.insert(checkinSymptom).values(tables.checkinSymptom as never);
        if (tables.checkinMedication.length)
            await tx.insert(checkinMedication).values(tables.checkinMedication as never);
        if (tables.intercourseLog.length) await tx.insert(intercourseLog).values(tables.intercourseLog as never);
        if (tables.dailySummaries.length) await tx.insert(dailySummary).values(tables.dailySummaries as never);
        if (tables.cyclePredictions.length) await tx.insert(cyclePrediction).values(tables.cyclePredictions as never);
        if (tables.cycleRecords.length) await tx.insert(cycleRecord).values(tables.cycleRecords as never);
        if (tables.contentSources.length) await tx.insert(contentSource).values(tables.contentSources as never);
        if (tables.contentItems.length) await tx.insert(contentItem).values(tables.contentItems as never);
        if (tables.contentRules.length) await tx.insert(contentRule).values(tables.contentRules as never);
        if (tables.contentDeliveryLog.length)
            await tx.insert(contentDeliveryLog).values(tables.contentDeliveryLog as never);
        if (tables.schemaMigrations.length) await tx.insert(schemaMigration).values(tables.schemaMigrations as never);

        const restoreFrom = earliestBackupDate(tables);
        for (const profileId of backupProfileIds(tables.profiles)) {
            await recalculateInTransaction(tx as CycleEngineTransaction, { profileId, from: restoreFrom });
        }
    });
}

function emptyBackupTables(): BackupTables {
    return {
        profiles: [],
        appSettings: [],
        reproductiveIntentHistory: [],
        periodRuns: [],
        pregnancyEpisodes: [],
        symptomCatalog: [],
        medicationCatalog: [],
        checkins: [],
        checkinSymptom: [],
        checkinMedication: [],
        intercourseLog: [],
        dailySummaries: [],
        cyclePredictions: [],
        cycleRecords: [],
        contentSources: [],
        contentItems: [],
        contentRules: [],
        contentDeliveryLog: [],
        schemaMigrations: [],
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function backupProfileIds(rows: readonly unknown[]): string[] {
    return Array.from(
        new Set(
            rows.flatMap((row) => {
                const id = isRecord(row) && typeof row.id === "string" ? row.id : null;
                return id ? [id] : [];
            }),
        ),
    );
}

function earliestBackupDate(tables: BackupTables): string {
    const dates = [
        ...readDates(tables.reproductiveIntentHistory, "effectiveFrom"),
        ...readDates(tables.periodRuns, "startDate"),
        ...readDates(tables.pregnancyEpisodes, "lmpDate"),
        ...readDates(tables.checkins, "localDate"),
    ].sort();
    return dates.at(0) ?? new Date().toISOString().slice(0, 10);
}

function readDates(rows: readonly unknown[], key: string): string[] {
    return rows.flatMap((row) => {
        const value = isRecord(row) ? row[key] : null;
        return typeof value === "string" ? [value] : [];
    });
}
