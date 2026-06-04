import { colors } from "@/theme";
import { EducationalAlert } from "@/types/insights.types";
import { translate } from "@/modules/localization/i18n";
import { AlertTone } from "../patterns.types";

/** Define tono visual y rótulo para alertas educativas. */
export default function getAlertTone(severity: EducationalAlert["severity"]): AlertTone {
    if (severity === "consult") {
        return {
            label: translate("common:alertTone.consult"),
            background: colors.periodSoft,
            ink: colors.period,
            icon: "stethoscope",
        };
    }

    if (severity === "watch") {
        return {
            label: translate("common:alertTone.watch"),
            background: colors.primarySoft,
            ink: colors.primaryDeep,
            icon: "eye-outline",
        };
    }

    return {
        label: translate("common:alertTone.info"),
        background: colors.surfaceSoft,
        ink: colors.muted,
        icon: "information-outline",
    };
}
