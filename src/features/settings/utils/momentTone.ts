import { colors } from "../../../theme";
import { MomentType } from "../../../types/records.types";

/** Devuelve color e indicador de fondo según tipo de momento. */
export default function momentTone(type: MomentType) {
    if (type === "morning") {
        return { color: colors.primaryDeep, background: colors.primarySoft };
    }

    if (type === "night") {
        return { color: "#7A5EC9", background: colors.lutealSoft };
    }

    return { color: colors.period, background: colors.periodSoft };
}
