import { DailyLog } from "@/types/records.types";

import { BuildDailyLogDetailsInput } from "../check-in.types";

/** Construye detalles opcionales del registro diario sin campos vacíos. */
export default function buildDailyLogDetails(
    input: BuildDailyLogDetailsInput,
): NonNullable<DailyLog["details"]> | null {
    const details: NonNullable<DailyLog["details"]> = {};

    if (input.periodStarted) {
        details.periodStarted = true;
    }

    if (input.periodEnded) {
        details.periodEnded = true;
    }

    if (input.pmsState !== "none") {
        details.pmsState = input.pmsState;
    }

    if (input.pmsState === "starting") {
        details.pmsStarted = true;
    }

    if (input.clotSize !== "none") {
        details.clotSize = input.clotSize;
    }

    if (input.painImpact !== "none") {
        details.painImpact = input.painImpact;
    }

    if (input.painLocations.length > 0) {
        details.painLocations = input.painLocations;
    }

    if (Object.keys(input.symptomIntensities).length > 0) {
        details.symptomIntensities = input.symptomIntensities;
    }

    if (input.libidoLevel !== "steady") {
        details.libidoLevel = input.libidoLevel;
    }

    if (input.breastSensitivity > 0) {
        details.breastSensitivity = input.breastSensitivity;
    }

    const cleanMedicationName = input.medicationName.trim();
    if (cleanMedicationName) {
        details.medicationName = cleanMedicationName;
    }

    if (input.medicationRelief !== "not_applicable") {
        details.medicationRelief = input.medicationRelief;
    }

    return Object.keys(details).length > 0 ? details : null;
}
