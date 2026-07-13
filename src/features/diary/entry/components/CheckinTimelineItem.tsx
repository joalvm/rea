import type { TFunction } from "i18next";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { bleedingKey } from "@/shared/utils/bleedingLabel";
import { extractTime } from "@/shared/utils/formatDate";

import type { CheckinDetail } from "../services/listCheckinsOfDay";

type Props = {
    detail: CheckinDetail;
    t: TFunction;
    testID?: string;
};

/**
 * Ítem de la línea de tiempo del detalle del diario: hora, cuerpo (sangrado +
 * síntomas + medicamentos) y nota opcional. No es tappable en la Fase 1 (solo
 * lectura); la edición llega en la Fase 2.
 */
export function CheckinTimelineItem({ detail, t, testID }: Props) {
    const theme = useTheme();
    const hasSymptoms = detail.symptoms.length > 0;
    const hasMedications = detail.medications.length > 0;
    const hasExtras = hasSymptoms || hasMedications;

    return (
        <View
            testID={testID}
            style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                borderWidth: theme.borderWidth.thin,
                borderColor: theme.colors.border,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                gap: theme.spacing.xs,
            }}
        >
            <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "center" }}>
                <View style={{ backgroundColor: theme.colors.primaryTint, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs }}>
                    <Text style={{ ...theme.typography.variant.caption, color: theme.colors.text, fontFamily: theme.typography.families.heading }}>
                        {extractTime(detail.recordedAt)}
                    </Text>
                </View>
                {detail.excludedFromSummary === 1 ? (
                    <View style={{ backgroundColor: theme.colors.warningSurface, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs }}>
                        <Text style={{ ...theme.typography.variant.caption, color: theme.colors.warningText }}>
                            {t("diary:list.excludedBadge")}
                        </Text>
                    </View>
                ) : null}
            </View>

            <Text style={{ ...theme.typography.variant.body, color: theme.colors.text }}>
                {String(t(`diary:${bleedingKey(detail.bleedingIntensity)}`))}
            </Text>

            {hasExtras ? (
                <Text style={{ ...theme.typography.variant.footnote, color: theme.colors.textSecondary }}>
                    {[
                        hasSymptoms ? t("diary:detail.symptomCount", { count: detail.symptoms.length }) : null,
                        hasMedications ? t("diary:detail.medicationCount", { count: detail.medications.length }) : null,
                    ]
                        .filter(Boolean)
                        .join(" · ")}
                </Text>
            ) : null}

            {detail.note ? (
                <Text style={{ ...theme.typography.variant.callout, color: theme.colors.textSecondary, fontStyle: "italic" }}>
                    {detail.note}
                </Text>
            ) : null}
        </View>
    );
}
