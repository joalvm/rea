import createDefaultNotificationCadence from "@/modules/notifications/defaults/createDefaultNotificationCadence";
import { Cycle } from "@/types/cycle.types";
import { DailyLog, DailyLogDetails, MoodCheckIn, SymptomKey } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import {
    CheckInEntity,
    CheckInMedicationEntity,
    CheckInSymptomEntity,
    PeriodRunEntity,
    ReproductiveIntentEntity,
    UserProfileEntity,
} from "../schemas/entities";
import {
    mapBleedingLevel,
    mapClotSize,
    mapLibidoLevel,
    mapMedicationReliefLabel,
    mapPainImpact,
} from "./checkInFieldMappers";

export interface CheckInWithSymptomRows {
    checkins: CheckInEntity[];
    medications: CheckInMedicationRow[];
    symptoms: CheckInSymptomEntity[];
}

type CheckInMedicationRow = CheckInMedicationEntity & { medication_name: string };

/** Construye settings de vista desde perfil local e intencion activa. */
export function buildSettings(
    profile: UserProfileEntity | null,
    intent: ReproductiveIntentEntity | null,
    periodRuns: PeriodRunEntity[],
): AppSettings | null {
    if (!profile || !intent) {
        return null;
    }

    return {
        onboarded: true,
        lastPeriodStart: periodRuns[0]?.start_date ?? intent.effective_from,
        cycleLength: intent.declared_cycle_length,
        periodLength: intent.declared_period_length,
        regularity: intent.regularity,
        hormonalContraception: intent.hormonal_contraception === 1,
        tryingToConceive: intent.trying_to_conceive === 1,
        createdAt: profile.created_at,
    };
}

/** Arma preferencias de notificacion desde perfil sin historial tecnico persistido. */
export function buildNotificationCadence(profile: UserProfileEntity) {
    return {
        ...createDefaultNotificationCadence(),
        enabled: profile.reminders_enabled === 1,
        intervalHours: profile.reminder_interval_hours,
        activeWindowStart: profile.reminder_window_start,
        activeWindowEnd: profile.reminder_window_end,
    };
}

/** Convierte bloque de periodo canonico a estructura consumida por calculos de ciclo. */
export function mapPeriodRunToCycle(run: PeriodRunEntity): Cycle {
    return {
        id: run.id,
        startDate: run.start_date,
        endDate: run.end_date,
        predicted: run.source === "bleeding_inferred",
        source: run.source === "user_confirmed" || run.source === "mixed" ? "observed" : "estimated",
        createdAt: run.created_at,
    };
}

/** Convierte check-in canonico a momento de bienestar usado por pantallas actuales. */
export function mapCheckInToMoment(checkIn: CheckInEntity): MoodCheckIn {
    return {
        id: checkIn.id,
        datetime: checkIn.recorded_at,
        momentType: "now",
        mood: checkIn.mood ?? 3,
        energy: checkIn.energy ?? 3,
        pain: checkIn.pain_intensity ?? 0,
        breastSensitivity: checkIn.breast_sensitivity ?? 0,
        stress: checkIn.stress_level ?? 0,
        note: checkIn.note,
    };
}

/** Agrupa check-ins canonicos por dia para superficies de diario/calendario. */
export function buildDailyLogs({ checkins, medications, symptoms }: CheckInWithSymptomRows) {
    const symptomsByCheckIn = groupSymptomsByCheckIn(symptoms);
    const medicationsByCheckIn = groupMedicationsByCheckIn(medications);
    const checkInsByDate = groupCheckInsByDate(checkins);

    return Array.from(checkInsByDate.entries())
        .map(([date, entries]): DailyLog => {
            const symptomIntensities = buildSymptomIntensities(entries, symptomsByCheckIn);

            return {
                date,
                bleedingLevel: mapBleedingLevel(maxMetric(entries, "bleeding_intensity")),
                symptoms: Object.keys(symptomIntensities) as SymptomKey[],
                notes: entries.find((entry) => entry.note)?.note ?? null,
                source: "observed",
                details: buildDailyLogDetails(entries, symptomIntensities, medicationsByCheckIn),
                updatedAt: entries[0]?.updated_at ?? new Date().toISOString(),
            };
        })
        .sort((left, right) => right.date.localeCompare(left.date));
}

function groupSymptomsByCheckIn(symptoms: CheckInSymptomEntity[]) {
    return symptoms.reduce<Map<string, CheckInSymptomEntity[]>>((accumulator, symptom) => {
        const current = accumulator.get(symptom.checkin_id) ?? [];
        current.push(symptom);
        accumulator.set(symptom.checkin_id, current);

        return accumulator;
    }, new Map());
}

function groupMedicationsByCheckIn(medications: CheckInMedicationRow[]) {
    return medications.reduce<Map<string, CheckInMedicationRow[]>>((accumulator, medication) => {
        const current = accumulator.get(medication.checkin_id) ?? [];
        current.push(medication);
        accumulator.set(medication.checkin_id, current);

        return accumulator;
    }, new Map());
}

function groupCheckInsByDate(checkins: CheckInEntity[]) {
    return checkins.reduce<Map<string, CheckInEntity[]>>((accumulator, checkIn) => {
        const current = accumulator.get(checkIn.local_date) ?? [];
        current.push(checkIn);
        accumulator.set(checkIn.local_date, current);

        return accumulator;
    }, new Map());
}

function buildSymptomIntensities(
    entries: CheckInEntity[],
    symptomsByCheckIn: Map<string, CheckInSymptomEntity[]>,
): Partial<Record<SymptomKey, number>> {
    const values: Partial<Record<SymptomKey, number>> = {};

    for (const entry of entries) {
        for (const symptom of symptomsByCheckIn.get(entry.id) ?? []) {
            const key = symptom.symptom_key as SymptomKey;
            values[key] = Math.max(values[key] ?? 0, symptom.intensity);
        }
    }

    return values;
}

function buildDailyLogDetails(
    entries: CheckInEntity[],
    symptomIntensities: Partial<Record<SymptomKey, number>>,
    medicationsByCheckIn: Map<string, CheckInMedicationRow[]>,
): DailyLogDetails | null {
    const maxPms = maxMetric(entries, "pms_intensity");
    const medication = getLatestMedication(entries, medicationsByCheckIn);
    const details: DailyLogDetails = {
        periodStarted: entries.some((entry) => entry.period_status_signal === "started"),
        periodEnded: entries.some((entry) => entry.period_status_signal === "ended"),
        pmsState: maxPms >= 3 ? "present" : maxPms > 0 ? "starting" : "none",
        clotSize: mapClotSize(maxMetric(entries, "clots")),
        painImpact: mapPainImpact(maxMetric(entries, "pain_interference")),
        painLocations: [],
        symptomIntensities,
        libidoLevel: mapLibidoLevel(maxMetric(entries, "libido")),
        breastSensitivity: maxMetric(entries, "breast_sensitivity"),
        medicationName: medication?.medication_name ?? null,
        medicationRelief: mapMedicationReliefLabel(medication?.relief),
    };
    const hasDetails =
        details.periodStarted ||
        details.periodEnded ||
        details.pmsState !== "none" ||
        details.clotSize !== "none" ||
        details.painImpact !== "none" ||
        Object.keys(symptomIntensities).length > 0 ||
        details.libidoLevel !== "steady" ||
        (details.breastSensitivity ?? 0) > 0 ||
        Boolean(details.medicationName);

    return hasDetails ? details : null;
}

function getLatestMedication(
    entries: CheckInEntity[],
    medicationsByCheckIn: Map<string, CheckInMedicationRow[]>,
): CheckInMedicationRow | null {
    const medications = entries.flatMap((entry) => medicationsByCheckIn.get(entry.id) ?? []);

    return medications.sort((left, right) => right.taken_at.localeCompare(left.taken_at))[0] ?? null;
}

function maxMetric<T extends keyof CheckInEntity>(entries: CheckInEntity[], key: T) {
    return entries.reduce((maxValue, entry) => {
        const value = entry[key];
        if (typeof value !== "number") {
            return maxValue;
        }

        return Math.max(maxValue, value);
    }, 0);
}
