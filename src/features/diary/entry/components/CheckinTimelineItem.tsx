import { EyeOff, Pencil, Trash2 } from "lucide-react-native";
import type { TFunction } from "i18next";
import { Pressable, Text, View } from "react-native";

import { ToggleRow } from "@/components/toggle-row/ToggleRow";
import { useTheme } from "@/theme/useTheme";
import { bleedingKey } from "@/shared/utils/bleedingLabel";
import { extractTime } from "@/shared/utils/formatDate";

import type { CheckinDetail } from "../services/listCheckinsOfDay";

type Props = {
    detail: CheckinDetail;
    t: TFunction;
    /** Callback de edición (solo se ofrece cuando `canEdit === true`). */
    onEdit?: () => void;
    /** Callback de borrado. Siempre disponible. */
    onDelete: () => void;
    /** Alterna la exclusión estadística del registro. */
    onToggleExclusion: (nextExcluded: boolean) => void;
    /** Si el registro puede editarse (es de hoy). */
    canEdit: boolean;
    testID?: string;
};

/**
 * Ítem de la línea de tiempo del detalle del diario: hora, cuerpo (sangrado +
 * síntomas + medicamentos), nota opcional, fila de acciones (editar / borrar) y
 * toggle de exclusión estadística al pie. Editar solo se ofrece si `canEdit`
 * (día actual); borrar y excluir siempre.
 */
export function CheckinTimelineItem({ detail, t, onEdit, onDelete, onToggleExclusion, canEdit, testID }: Props) {
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

            <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.xs, paddingTop: theme.spacing.sm, borderTopWidth: theme.borderWidth.hairline, borderTopColor: theme.colors.divider }}>
                {canEdit && onEdit ? (
                    <Pressable
                        onPress={onEdit}
                        accessibilityRole="button"
                        accessibilityLabel={t("diary:detail.editLabel")}
                        style={({ pressed }) => ({
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: theme.spacing.xs,
                            height: 36,
                            borderRadius: theme.radius.pill,
                            borderWidth: theme.borderWidth.thin,
                            borderColor: theme.colors.border,
                            opacity: pressed ? 0.6 : 1,
                        })}
                    >
                        <Pencil size={14} color={theme.colors.textSecondary} strokeWidth={2.2} />
                        <Text style={{ ...theme.typography.variant.caption, color: theme.colors.textSecondary }}>
                            {t("diary:detail.editLabel")}
                        </Text>
                    </Pressable>
                ) : null}
                <Pressable
                    onPress={onDelete}
                    accessibilityRole="button"
                    accessibilityLabel={t("diary:detail.deleteLabel")}
                    style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: theme.spacing.xs,
                        height: 36,
                        borderRadius: theme.radius.pill,
                        borderWidth: theme.borderWidth.thin,
                        borderColor: theme.colors.border,
                        opacity: pressed ? 0.6 : 1,
                    })}
                >
                    <Trash2 size={14} color={theme.colors.dangerText} strokeWidth={2.2} />
                    <Text style={{ ...theme.typography.variant.caption, color: theme.colors.dangerText }}>
                        {t("diary:detail.deleteLabel")}
                    </Text>
                </Pressable>
            </View>

            <ToggleRow
                title={t("diary:detail.excludeTitle")}
                subtitle={t("diary:detail.excludeSubtitle")}
                Icon={EyeOff}
                value={detail.excludedFromSummary === 1}
                onChange={onToggleExclusion}
                accent={theme.colors.warning}
            />
        </View>
    );
}
