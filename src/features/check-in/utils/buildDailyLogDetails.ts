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

    if (input.pmsStarted) {
        details.pmsStarted = true;
    }

    if (input.clotSize !== "none") {
        details.clotSize = input.clotSize;
    }

    if (input.painImpact !== "none") {
        details.painImpact = input.painImpact;
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
