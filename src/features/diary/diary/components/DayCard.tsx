import { ChevronRight } from "lucide-react-native";
import type { TFunction } from "i18next";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { bleedingPreviewKey } from "@/shared/utils/bleedingLabel";
import { extractTime, formatShortDate } from "@/shared/utils/formatDate";

import type { DayGroup } from "../utils/groupByDay";

type Props = {
    group: DayGroup;
    onPress: (localDate: string) => void;
    t: TFunction;
    testID?: string;
};

/**
 * Tarjeta de un día en la lista del diario. Muestra fecha legible, badge de
 * conteo de registros, preview del sangrado del último registro, nota truncada y
 * hora del último registro. Tappable → abre el detalle del día.
 */
export function DayCard({ group, onPress, t, testID }: Props) {
    const theme = useTheme();
    const { latest, items } = group;
    const count = items.length;
    const isExcluded = latest.excludedFromSummary === 1;

    return (
        <Pressable
            testID={testID}
            onPress={() => onPress(group.localDate)}
            accessibilityRole="button"
            accessibilityLabel={formatShortDate(t, group.localDate)}
            style={({ pressed }) => [
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radius.lg,
                    borderWidth: theme.borderWidth.thin,
                    borderColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    ...theme.shadows[1],
                },
                pressed && { opacity: 0.85 },
            ]}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.sm }}>
                <Text style={{ ...theme.typography.variant.title, color: theme.colors.text }}>
                    {formatShortDate(t, group.localDate)}
                </Text>
                <View style={{ flexDirection: "row", gap: theme.spacing.xs, alignItems: "center" }}>
                    {isExcluded ? (
                        <View style={{ backgroundColor: theme.colors.warningSurface, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs }}>
                            <Text style={{ ...theme.typography.variant.caption, color: theme.colors.warningText }}>
                                {t("diary:list.excludedBadge")}
                            </Text>
                        </View>
                    ) : null}
                    <View style={{ backgroundColor: theme.colors.primarySubtle, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs }}>
                        <Text style={{ ...theme.typography.variant.caption, color: theme.colors.text }}>
                            {t("diary:list.entryCount", { count })}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ marginTop: theme.spacing.xs, gap: theme.spacing.xs }}>
                <Text
                    style={{ ...theme.typography.variant.body, color: theme.colors.textSecondary }}
                    numberOfLines={2}
                >
                    {t(bleedingPreviewKey(latest.bleedingIntensity))}
                    {latest.note ? ` · ${t("diary:list.notePreview", { note: latest.note })}` : ""}
                </Text>
                <Text style={{ ...theme.typography.variant.footnote, color: theme.colors.textMuted }}>
                    {t("diary:list.lastAt", { time: extractTime(latest.recordedAt) })}
                </Text>
            </View>

            <View style={{ position: "absolute", right: theme.spacing.lg, bottom: theme.spacing.md, opacity: 0.5 }}>
                <ChevronRight size={theme.sizing.iconSm} color={theme.colors.textMuted} strokeWidth={2.4} />
            </View>
        </Pressable>
    );
}
