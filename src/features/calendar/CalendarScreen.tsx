import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state/EmptyState";
import { IconButton } from "@/components/icon-button/IconButton";
import { InlineNotice } from "@/components/inline-notice/InlineNotice";
import { useDailySummary } from "@/domain/hooks/useDailySummary";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { formatDate } from "@/modules/l10n/formatDate";
import { useMonthCursor } from "@/shared/hooks/useMonthCursor";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";

import { MonthGrid } from "./components/MonthGrid";
import { useCalendarStyles } from "./CalendarStyle";

/** Tab Calendario: fuente visual de daily_summary; distingue hechos y estimaciones antes de abrir el detalle diario. */
export default function CalendarScreen() {
    const { t } = useTranslation("calendar");
    const router = useRouter();
    const styles = useCalendarStyles();
    const { profile } = useLocalProfile();
    const { cursor, range, prev, next, reset, isCurrent } = useMonthCursor();
    const { summaries } = useDailySummary(profile?.id ?? "", range);
    const [selectedDate, setSelectedDate] = useState(() => ymdToISO(todayYMD()));
    const monthLabel = formatDate(range.from, "monthYear");

    const handleOpenDay = (localDate: string) => {
        setSelectedDate(localDate);
        router.push(`/diary/${localDate}`);
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("title")}</Text>
                <Text style={styles.description}>{t("description")}</Text>
            </View>

            <View style={styles.monthHeader}>
                <IconButton
                    Icon={ChevronLeft}
                    accessibilityLabel={t("actions.previousMonth")}
                    onPress={prev}
                    testID="calendar-month-prev"
                />
                <View style={styles.monthTitleWrap}>
                    <Text style={styles.monthTitle}>{monthLabel}</Text>
                    {!isCurrent ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("actions.today")}
                            onPress={reset}
                            style={({ pressed }) => [styles.todayAction, pressed && styles.pressed]}
                        >
                            <Text style={styles.todayActionLabel}>{t("actions.today")}</Text>
                        </Pressable>
                    ) : null}
                </View>
                <IconButton
                    Icon={ChevronRight}
                    accessibilityLabel={t("actions.nextMonth")}
                    onPress={next}
                    testID="calendar-month-next"
                />
            </View>

            <InlineNotice title={t("notice.title")}>{t("notice.body")}</InlineNotice>

            <View style={styles.calendarCard}>
                <MonthGrid
                    cursor={cursor}
                    onPressDay={handleOpenDay}
                    selectedDate={selectedDate}
                    summaries={summaries}
                />
            </View>

            <View style={styles.legend}>
                <LegendItem color="danger" label={t("legend.menstruation")} />
                <LegendItem color="warning" label={t("legend.fertile")} />
                <LegendItem color="primary" label={t("legend.record")} />
            </View>

            {summaries.length === 0 ? (
                <EmptyState
                    Icon={CalendarDays}
                    title={t("empty.title")}
                    description={t("empty.description")}
                    action={{
                        label: t("empty.action"),
                        onPress: () => router.push("/checkin"),
                        testID: "calendar-empty-checkin",
                    }}
                    testID="calendar-empty"
                />
            ) : null}
        </ScrollView>
    );
}

type LegendItemProps = {
    color: "danger" | "warning" | "primary";
    label: string;
};

function LegendItem({ color, label }: LegendItemProps) {
    const styles = useCalendarStyles();
    const palette = {
        danger: styles.legendMenstruation,
        primary: styles.legendRecord,
        warning: styles.legendFertile,
    };

    return (
        <View accessibilityLabel={label} style={styles.legendItem}>
            <View style={[styles.legendMark, palette[color]]} />
            <Text style={styles.legendLabel}>{label}</Text>
        </View>
    );
}
