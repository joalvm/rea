import type { TFunction } from "i18next";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { DailySummary } from "@/db/schema/dailySummary";
import { formatDate } from "@/modules/l10n/formatDate";
import { addDaysToISO, todayYMD, ymdToISO } from "@/shared/utils/ymd";
import type { SemanticColors } from "@/theme/types/SemanticColors";
import { useTheme } from "@/theme/useTheme";

import { useMonthGridStyles } from "./MonthGridStyle";

type Props = {
    cursor: { year: number; month: number };
    summaries: DailySummary[];
    selectedDate: string;
    onPressDay: (localDate: string) => void;
};

type DayStatus = {
    accent?: keyof SemanticColors;
    hasEvent: boolean;
    label: string;
    surface?: keyof SemanticColors;
    text?: keyof SemanticColors;
};

const DAYS_PER_WEEK = 7;
const WEEKS_PER_MONTH_VIEW = 6;
const MONTH_CELL_COUNT = DAYS_PER_WEEK * WEEKS_PER_MONTH_VIEW;
const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Rejilla mensual de 42 celdas. Pinta hechos observados y estimaciones sin usar color como único canal. */
export function MonthGrid({ cursor, summaries, selectedDate, onPressDay }: Props) {
    const { t } = useTranslation("calendar");
    const theme = useTheme();
    const styles = useMonthGridStyles();
    const firstDate = new Date(cursor.year, cursor.month - 1, 1);
    const firstOfMonth = ymdToISO({ year: cursor.year, month: cursor.month, day: 1 });
    const startDate = addDaysToISO(firstOfMonth, -firstDate.getDay());
    const summaryByDate = new Map(summaries.map((summary) => [summary.localDate, summary]));
    const today = ymdToISO(todayYMD());
    const monthPrefix = `${cursor.year}-${String(cursor.month).padStart(2, "0")}`;

    return (
        <View accessibilityLabel={t("title")} style={styles.grid}>
            {WEEKDAY_KEYS.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>
                    {t(`weekdays.${weekday}`)}
                </Text>
            ))}

            {Array.from({ length: MONTH_CELL_COUNT }, (_, index) => {
                const localDate = addDaysToISO(startDate, index);
                const summary = summaryByDate.get(localDate);
                const isCurrentMonth = localDate.startsWith(monthPrefix);
                const isSelected = localDate === selectedDate;
                const isToday = localDate === today;
                const day = Number(localDate.slice(-2));
                const status = getStatus(summary, t);

                if (!isCurrentMonth) {
                    return (
                        <View key={localDate} accessibilityLabel={formatDate(localDate, "long")} style={styles.cell}>
                            <Text style={styles.outsideDay}>{day}</Text>
                        </View>
                    );
                }

                return (
                    <Pressable
                        key={localDate}
                        accessibilityLabel={t("day.accessibility", {
                            date: formatDate(localDate, "long"),
                            status: status.label,
                        })}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => onPressDay(localDate)}
                        testID={`calendar-day-${localDate}`}
                        style={({ pressed }) => [
                            styles.cell,
                            status.surface && { backgroundColor: theme.colors[status.surface] },
                            isSelected && { borderColor: theme.colors.primary, borderWidth: theme.borderWidth.thick },
                            isToday && styles.today,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={[styles.day, status.text && { color: theme.colors[status.text] }]}>{day}</Text>
                        {status.hasEvent && status.accent ? (
                            <View style={[styles.eventDot, { backgroundColor: theme.colors[status.accent] }]} />
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}

function getStatus(summary: DailySummary | undefined, t: TFunction<"calendar">): DayStatus {
    if (!summary) {
        return { hasEvent: false, label: t("day.none") };
    }

    if (summary.isMenstruationDay) {
        return {
            accent: "danger",
            hasEvent: summary.checkinCount > 0,
            label: t("day.menstruation"),
            surface: "dangerSurface",
            text: "dangerText",
        };
    }

    if (summary.isFertileDay) {
        return {
            accent: "warning",
            hasEvent: summary.checkinCount > 0,
            label: t("day.fertile"),
            surface: "warningSurface",
            text: "warningText",
        };
    }

    return {
        accent: "primary",
        hasEvent: summary.checkinCount > 0 || summary.hadMedication || summary.hadIntercourse,
        label: summary.phaseSource === "estimated" ? t("day.estimated") : t("day.recorded"),
    };
}
