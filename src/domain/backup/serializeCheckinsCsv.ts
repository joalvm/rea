import type { ReaBackup } from "./serializeBackup";

const COLUMNS = [
    ["record_type", "recordType"],
    ["local_date", "localDate"],
    ["recorded_at", "recordedAt"],
    ["mood", "mood"],
    ["energy", "energy"],
    ["pain_intensity", "painIntensity"],
    ["basal_body_temp_c", "basalBodyTempC"],
    ["opk_result", "opkResult"],
    ["pregnancy_test_result", "pregnancyTestResult"],
    ["note", "note"],
    ["cycle_start_date", "startDate"],
    ["cycle_end_date", "endDate"],
    ["cycle_length", "cycleLength"],
    ["period_length", "periodLength"],
    ["ovulation_date", "ovulationDate"],
    ["ovulation_basis", "ovulationBasis"],
    ["luteal_length", "lutealLength"],
    ["predicted_start", "predictedStart"],
    ["prediction_error_days", "predictionErrorDays"],
    ["is_valid", "isValid"],
] as const;

/** Exporta el subconjunto legible de check-ins para análisis externo sin alterar el backup completo. */
export function serializeCheckinsCsv(backup: ReaBackup): string {
    const rows: Record<string, unknown>[] = [
        ...backup.tables.checkins.filter(isRecord).map((row) => ({ ...row, recordType: "checkin" })),
        ...backup.tables.cycleRecords.filter(isRecord).map((row) => ({ ...row, recordType: "cycle_summary" })),
    ];
    return [
        COLUMNS.map(([header]) => header).join(","),
        ...rows.map((row) => COLUMNS.map(([, key]) => escapeCsv(row[key])).join(",")),
    ].join("\n");
}

function escapeCsv(value: unknown): string {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
