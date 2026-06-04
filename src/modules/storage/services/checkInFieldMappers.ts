import { DailyLog, DailyLogDetails, MedicationRelief } from "@/types/records.types";

/** Convierte intensidad UI de sangrado a escala canonica SQLite 0-4. */
export function mapBleedingIntensity(value: DailyLog["bleedingLevel"]) {
    switch (value) {
        case "heavy":
            return 4;
        case "medium":
            return 3;
        case "light":
            return 2;
        case "spotting":
            return 1;
        case "none":
        default:
            return 0;
    }
}

/** Convierte escala canonica 0-4 a etiqueta de vista existente. */
export function mapBleedingLevel(value: number): DailyLog["bleedingLevel"] {
    if (value >= 4) {
        return "heavy";
    }

    if (value === 3) {
        return "medium";
    }

    if (value === 2) {
        return "light";
    }

    if (value === 1) {
        return "spotting";
    }

    return "none";
}

/** Convierte coagulos observados a escala canonica 0-3. */
export function mapClots(value: NonNullable<DailyLog["details"]>["clotSize"]) {
    switch (value) {
        case "large":
            return 3;
        case "medium":
            return 2;
        case "small":
            return 1;
        case "none":
        default:
            return 0;
    }
}

/** Convierte escala canonica 0-3 a etiqueta de coagulos. */
export function mapClotSize(value: number): NonNullable<DailyLogDetails["clotSize"]> {
    if (value >= 3) {
        return "large";
    }

    if (value === 2) {
        return "medium";
    }

    if (value === 1) {
        return "small";
    }

    return "none";
}

/** Convierte libido UI a escala canonica 0-4. */
export function mapLibido(value: NonNullable<DailyLog["details"]>["libidoLevel"]) {
    switch (value) {
        case "high":
            return 4;
        case "steady":
            return 3;
        case "low":
            return 1;
        case "very_low":
        default:
            return 0;
    }
}

/** Convierte escala canonica 0-4 a etiqueta de libido. */
export function mapLibidoLevel(value: number): NonNullable<DailyLogDetails["libidoLevel"]> {
    if (value >= 4) {
        return "high";
    }

    if (value === 2 || value === 3) {
        return "steady";
    }

    if (value === 1) {
        return "low";
    }

    return "very_low";
}

/** Convierte impacto de dolor UI a escala canonica 0-3. */
export function mapPainInterference(value: NonNullable<DailyLog["details"]>["painImpact"]) {
    switch (value) {
        case "stops_day":
            return 3;
        case "limits_day":
            return 2;
        case "noticeable":
            return 1;
        case "none":
        default:
            return 0;
    }
}

/** Convierte escala canonica 0-3 a etiqueta de impacto de dolor. */
export function mapPainImpact(value: number): NonNullable<DailyLogDetails["painImpact"]> {
    if (value >= 3) {
        return "stops_day";
    }

    if (value === 2) {
        return "limits_day";
    }

    if (value === 1) {
        return "noticeable";
    }

    return "none";
}

/** Convierte SPM UI a escala canonica conservadora 0-5. */
export function mapPmsIntensity(value: NonNullable<DailyLog["details"]>["pmsState"]) {
    switch (value) {
        case "present":
            return 4;
        case "starting":
            return 2;
        case "none":
        default:
            return 0;
    }
}

/** Convierte alivio percibido a escala canonica 0-2. */
export function mapMedicationRelief(value: MedicationRelief) {
    switch (value) {
        case "helped":
            return 2;
        case "partly_helped":
            return 1;
        case "did_not_help":
        case "not_applicable":
        default:
            return 0;
    }
}
