import { colors } from "../../../theme";
import { EducationalAlert } from "../../../types/insights.types";
import { AlertTone } from "../patterns.types";

/** Define tono visual y rótulo para alertas educativas. */
export default function getAlertTone(severity: EducationalAlert["severity"]): AlertTone {
    if (severity === "consult") {
        return {
            label: "Consultar",
            background: colors.periodSoft,
            ink: colors.period,
            icon: "stethoscope",
        };
    }

    if (severity === "watch") {
        return {
            label: "Vigilar",
            background: colors.primarySoft,
            ink: colors.primaryDeep,
            icon: "eye-outline",
        };
    }

    return {
        label: "Info",
        background: colors.surfaceSoft,
        ink: colors.muted,
        icon: "information-outline",
    };
}
