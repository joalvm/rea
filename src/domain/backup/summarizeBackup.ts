import type { ReaBackup } from "./serializeBackup";

export type BackupSummary = {
    checkinCount: number;
    cycleCount: number;
    from: string | null;
    to: string | null;
};

/** Extrae el resumen mínimo que la UI debe enseñar antes de reemplazar datos locales. */
export function summarizeBackup(backup: ReaBackup): BackupSummary {
    const dates = [
        ...backup.tables.checkins.flatMap((row) => readDate(row, "localDate")),
        ...backup.tables.cycleRecords.flatMap((row) => readDate(row, "startDate")),
        ...backup.tables.cycleRecords.flatMap((row) => readDate(row, "endDate")),
    ].sort();

    return {
        checkinCount: backup.tables.checkins.length,
        cycleCount: backup.tables.cycleRecords.length,
        from: dates.at(0) ?? null,
        to: dates.at(-1) ?? null,
    };
}

function readDate(row: unknown, key: string): string[] {
    if (typeof row !== "object" || row === null) return [];
    const value = (row as Record<string, unknown>)[key];
    return typeof value === "string" ? [value] : [];
}
