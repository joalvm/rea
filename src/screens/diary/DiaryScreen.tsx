import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { BrandMark } from "@/ui/BrandMark";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftButton } from "@/ui/SoftButton";
import styles from "./DiaryScreen.styles";
import CheckInRow from "./components/CheckInRow";
import DailyLogRow from "./components/DailyLogRow";
import DiaryEmptyState from "./components/DiaryEmptyState";

/** Props del screen de diario y edición de registros. */
interface DiaryScreenProps {
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onOpenCheckIn: () => void;
    onOpenQuickCheckIn: () => void;
    onEditCheckIn: (entry: MoodCheckIn, initialDailyLog?: DailyLog | null) => void;
    onEditDailyLog: (entry: DailyLog) => void;
}

export function DiaryScreen({
    dailyLogs,
    moodCheckIns,
    onOpenCheckIn,
    onOpenQuickCheckIn,
    onEditCheckIn,
    onEditDailyLog,
}: DiaryScreenProps) {
    const { t } = useTranslation("diary");
    const latest = moodCheckIns.slice(0, 12);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader
                titleIcon={<BrandMark color={colors.primaryDeep} size={24} />}
                subtitle={t("header.subtitle")}
                title={t("header.title")}
            />

            <View style={styles.actions}>
                <SoftButton label={t("quickActions.daily")} onPress={onOpenCheckIn} style={styles.actionButton} />
                <SoftButton
                    label={t("quickActions.now")}
                    onPress={onOpenQuickCheckIn}
                    style={styles.actionButton}
                    variant="secondary"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.latestMoments")}</Text>
                {latest.length === 0 ? (
                    <DiaryEmptyState />
                ) : (
                    latest.map((item) => {
                        const itemDate = item.datetime.slice(0, 10);
                        const initialDailyLog = dailyLogs.find((log) => log.date === itemDate) ?? null;

                        return (
                            <CheckInRow
                                item={item}
                                key={item.id ?? item.datetime}
                                onEdit={() => onEditCheckIn(item, initialDailyLog)}
                            />
                        );
                    })
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.dailyLogs")}</Text>
                {dailyLogs.length === 0 ? (
                    <DiaryEmptyState label={t("empty.dailyLogs")} />
                ) : (
                    dailyLogs.map((log) => <DailyLogRow key={log.date} log={log} onEdit={() => onEditDailyLog(log)} />)
                )}
            </View>
        </ScrollView>
    );
}
