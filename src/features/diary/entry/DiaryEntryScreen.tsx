import { Plus } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useTheme } from "@/theme/useTheme";
import { formatLongDate } from "@/shared/utils/formatDate";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";

import { CheckinTimelineItem } from "./components/CheckinTimelineItem";
import { useCheckinsOfDay } from "./hooks/useCheckinsOfDay";
import { useDeleteCheckin } from "./hooks/useDeleteCheckin";
import { useToggleExclusion } from "./hooks/useToggleExclusion";
import { summarizeDay } from "./utils/summarizeDay";
import { useDiaryEntryStyles } from "./DiaryEntryStyle";

type Props = {
    date: string;
    onStartCheckin: () => void;
    onEdit: (checkinId: string) => void;
};

/**
 * Detalle de día (`diary/[date]`): línea de tiempo de los registros del día +
 * mini-resumen calculado en memoria + CTA "Nuevo registro". Fase 2: cada ítem
 * puede borrarse (con deshacer) y, si es de hoy, editarse.
 */
export default function DiaryEntryScreen({ date, onStartCheckin, onEdit }: Props) {
    const styles = useDiaryEntryStyles();
    const theme = useTheme();
    const { t } = useTranslation();
    const { profile } = useLocalProfile();
    const { details, loading, reload } = useCheckinsOfDay(profile?.id, date);
    const { confirmAndRemove } = useDeleteCheckin(reload);
    const { toggle: toggleExclusion } = useToggleExclusion(reload);
    const summary = useMemo(() => summarizeDay(details), [details]);
    const isToday = date === ymdToISO(todayYMD());

    const hasSummary = summary.moodAvg != null || summary.energyAvg != null || summary.symptomCount > 0 || summary.medicationCount > 0 || summary.bleedingMax != null;

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.dateTitle}>{formatLongDate(t, date)}</Text>
                </View>

                {loading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>{t("diary:detail.loading")}</Text>
                    </View>
                ) : details.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{t("diary:detail.noEntries")}</Text>
                        <PrimaryButton
                            label={t("diary:detail.startCheckin")}
                            onPress={onStartCheckin}
                            Icon={Plus}
                            testID="diary-entry-start"
                        />
                    </View>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("diary:detail.timelineTitle")}</Text>
                            <View style={styles.timeline}>
                                {details.map((detail) => (
                                    <CheckinTimelineItem
                                        key={detail.id}
                                        detail={detail}
                                        t={t}
                                        canEdit={isToday}
                                        onEdit={() => onEdit(detail.id)}
                                        onDelete={() => confirmAndRemove(detail.id)}
                                        onToggleExclusion={(next) => toggleExclusion(detail.id, next)}
                                        testID={`diary-entry-timeline-${detail.id}`}
                                    />
                                ))}
                            </View>
                        </View>

                        {hasSummary ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t("diary:detail.summaryTitle")}</Text>
                                <View style={styles.summaryCard}>
                                    {summary.moodAvg != null ? (
                                        <SummaryRow label={t("diary:detail.moodAvg")} value={summary.moodAvg.toFixed(1)} styles={styles} />
                                    ) : null}
                                    {summary.energyAvg != null ? (
                                        <SummaryRow label={t("diary:detail.energyAvg")} value={summary.energyAvg.toFixed(1)} styles={styles} />
                                    ) : null}
                                    {summary.bleedingMax != null ? (
                                        <SummaryRow label={t("diary:detail.bleedingMax")} value={String(summary.bleedingMax)} styles={styles} />
                                    ) : null}
                                    <SummaryRow label={t("diary:detail.symptomCount")} value={String(summary.symptomCount)} styles={styles} />
                                    <SummaryRow label={t("diary:detail.medicationCount")} value={String(summary.medicationCount)} styles={styles} />
                                </View>
                            </View>
                        ) : null}
                    </>
                )}
            </ScrollView>

            {!loading && details.length > 0 ? (
                <View style={styles.footer}>
                    <PrimaryButton
                        label={t("diary:detail.startCheckin")}
                        onPress={onStartCheckin}
                        Icon={Plus}
                        testID="diary-entry-start"
                    />
                </View>
            ) : null}
        </View>
    );
}

type SummaryRowProps = {
    label: string;
    value: string;
    styles: ReturnType<typeof useDiaryEntryStyles>;
};

function SummaryRow({ label, value, styles }: SummaryRowProps) {
    return (
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
}
