import { PhaseKey } from "@/types/cycle.types";

/** Devuelve label legible para fase de ciclo. */
export default function getPhaseLabel(phase: PhaseKey): string {
    switch (phase) {
        case "menstrual":
            return "Periodo";
        case "follicular":
            return "Fase folicular";
        case "fertile":
            return "Fase fértil";
        case "luteal":
            return "Fase lútea";
    }
}

/** Devuelve label con artículo usado en copy explicativo. */
export function phaseLabelWithArticle(phase: PhaseKey) {
    if (phase === "menstrual") {
        return "tu fase menstrual";
    }

    if (phase === "follicular") {
        return "tu fase folicular";
    }

    if (phase === "fertile") {
        return "tu ventana fértil orientativa";
    }

    return "tu fase lútea";
}
