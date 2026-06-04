import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import estimateCycle from "@/modules/cycle/estimation/estimateCycle";
import { toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import { labelSymptom } from "@/modules/cycle/utils/symptomCatalog";
import { AccentToneName, colors } from "@/theme";
import { Cycle } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { BrandMark } from "@/ui/BrandMark";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftButton } from "@/ui/SoftButton";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./DayDetailScreen.styles";
import CareTipRow from "./components/CareTipRow";
import MomentEntryRow from "./components/MomentEntryRow";
import {
    bleedingLabel,
    buildDailyLogDetails,
    buildDaySummary,
    formatLongDate,
    getCareTips,
    sourceLabel,
} from "./utils/dayDetailContent";

/** Props del screen de detalle por día seleccionado. */
interface DayDetailScreenProps {
    selectedIso: string;
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onBack: () => void;
    onOpenDiary: () => void;
}

export function DayDetailScreen({
    selectedIso,
    settings,
    cycles,
    dailyLogs,
    moodCheckIns,
    onBack,
    onOpenDiary,
}: DayDetailScreenProps) {
    const { t } = useTranslation("dayDetail");
    const snapshot = estimateCycle(settings, cycles, dailyLogs, selectedIso, moodCheckIns);
    const todayIso = toIsoDate(new Date());
    const isFuture = selectedIso > todayIso;
    const dailyLog = dailyLogs.find((entry) => entry.date === selectedIso) ?? null;
    const moments = moodCheckIns
        .filter((entry) => toIsoDate(new Date(entry.datetime)) === selectedIso)
        .sort((left, right) => right.datetime.localeCompare(left.datetime));
    const detailItems = dailyLog ? buildDailyLogDetails(dailyLog) : [];
    const careTips = getCareTips(snapshot.phase);
    const summary = buildDaySummary(selectedIso, todayIso, snapshot.phaseMessage, dailyLog, moments);
    const hasRecords = Boolean(dailyLog || moments.length > 0);
    const summaryTone: AccentToneName =
        snapshot.phase === "menstrual"
            ? "period"
            : snapshot.phase === "fertile"
              ? "fertile"
              : snapshot.phase === "luteal"
                ? "luteal"
                : "primary";

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader
                leading={
                    <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="arrow-left" size={20} />
                    </Pressable>
                }
                subtitle={`${snapshot.phaseLabel} · ${snapshot.phaseSourceLabel}`}
                titleIcon={<BrandMark color={colors.primaryDeep} size={20} />}
                title={formatLongDate(selectedIso)}
            />

            <SoftCard style={styles.summaryCard} tone={summaryTone} variant="accent">
                <Text style={styles.cardTitle}>{t("quickRead.title")}</Text>
                <Text style={styles.summaryText}>{summary}</Text>
                <View style={styles.badges}>
                    <Text style={styles.badge}>{snapshot.fertilityStatusLabel}</Text>
                    {dailyLog?.bleedingLevel && dailyLog.bleedingLevel !== "none" ? (
                        <Text style={styles.badge}>{bleedingLabel(dailyLog.bleedingLevel)}</Text>
                    ) : null}
                </View>
            </SoftCard>

            <SoftCard style={styles.card}>
                <Text style={styles.cardTitle}>{isFuture ? t("sections.futureView") : t("sections.whatToWatch")}</Text>
                <Text style={styles.cardBody}>{snapshot.phaseMessage}</Text>
                {careTips.map((tip) => (
                    <CareTipRow key={tip.text} tip={tip} />
                ))}
            </SoftCard>

            {dailyLog ? (
                <SoftCard style={styles.card}>
                    <Text style={styles.cardTitle}>{t("daily.title")}</Text>
                    <Text style={styles.metaLine}>
                        {sourceLabel(dailyLog.source)} · {bleedingLabel(dailyLog.bleedingLevel)}
                    </Text>
                    {dailyLog.symptoms.length > 0 ? (
                        <View style={styles.chips}>
                            {dailyLog.symptoms.map((symptom) => (
                                <Text key={symptom} style={styles.chip}>
                                    {labelSymptom(symptom)}
                                </Text>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.softText}>{t("daily.noSymptoms")}</Text>
                    )}
                    {detailItems.length > 0 ? (
                        <View style={styles.chips}>
                            {detailItems.map((detail) => (
                                <Text key={detail} style={styles.detailChip}>
                                    {detail}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                    {dailyLog.notes ? <Text style={styles.note}>{dailyLog.notes}</Text> : null}
                </SoftCard>
            ) : null}

            {moments.length > 0 ? (
                <SoftCard style={styles.card}>
                    <Text style={styles.cardTitle}>{t("moments.title")}</Text>
                    {moments.map((entry) => (
                        <MomentEntryRow entry={entry} key={entry.id ?? entry.datetime} />
                    ))}
                </SoftCard>
            ) : null}

            {!hasRecords && !isFuture ? (
                <SoftCard style={styles.card} variant="soft">
                    <Text style={styles.cardTitle}>{t("empty.title")}</Text>
                    <Text style={styles.cardBody}>{t("empty.body")}</Text>
                </SoftCard>
            ) : null}

            {hasRecords || selectedIso <= todayIso ? (
                <SoftButton
                    label={t("actions.openDiary")}
                    onPress={onOpenDiary}
                    style={styles.actionButton}
                    variant="secondary"
                />
            ) : null}
        </ScrollView>
    );
}
