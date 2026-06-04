import { translate } from "@/modules/localization/i18n";
import { PhaseKey } from "@/types/cycle.types";

/** Devuelve label legible para fase de ciclo. */
export default function getPhaseLabel(phase: PhaseKey): string {
    switch (phase) {
        case "menstrual":
            return translate("cycle:phase.menstrual");
        case "follicular":
            return translate("cycle:phase.follicular");
        case "fertile":
            return translate("cycle:phase.fertile");
        case "luteal":
            return translate("cycle:phase.luteal");
    }
}

/** Devuelve label con artículo usado en copy explicativo. */
export function phaseLabelWithArticle(phase: PhaseKey) {
    if (phase === "menstrual") {
        return translate("cycle:phase.menstrualArticle");
    }

    if (phase === "follicular") {
        return translate("cycle:phase.follicularArticle");
    }

    if (phase === "fertile") {
        return translate("cycle:phase.fertileArticle");
    }

    return translate("cycle:phase.lutealArticle");
}
