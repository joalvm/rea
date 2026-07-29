import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { CyclePrediction } from "@/db/schema/cyclePrediction";
import type { DailySummary } from "@/db/schema/dailySummary";
import { formatDate } from "@/modules/l10n/formatDate";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";
import { useTheme } from "@/theme/useTheme";

import { useMonthGridStyles } from "./MonthGridStyle";
import { getMonthGridCells, type MonthGridCursor } from "./monthGridCells";

type Props = {
    cursor: MonthGridCursor;
    summaries: DailySummary[];
    selectedDate: string;
    prediction: CyclePrediction | null;
    onPressDay: (localDate: string) => void;
};

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Rejilla mensual de 42 celdas. Pinta hechos observados y estimaciones sin usar color como único canal. */
export function MonthGrid({ cursor, summaries, selectedDate, prediction, onPressDay }: Props) {
    const { t } = useTranslation("calendar");
    const theme = useTheme();
    const styles = useMonthGridStyles();
    const cells = getMonthGridCells({
        cursor,
        prediction,
        selectedDate,
        summaries,
        today: ymdToISO(todayYMD()),
        t,
    });

    return (
        <View accessibilityLabel={t("title")} style={styles.grid}>
            {WEEKDAY_KEYS.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>
                    {t(`weekdays.${weekday}`)}
                </Text>
            ))}

            {cells.map((cell) => {
                if (!cell.isCurrentMonth) {
                    return (
                        <View key={cell.date} accessibilityLabel={formatDate(cell.date, "long")} style={styles.cell}>
                            <Text style={styles.outsideDay}>{cell.day}</Text>
                        </View>
                    );
                }

                return (
                    <Pressable
                        key={cell.date}
                        accessibilityLabel={t("day.accessibility", {
                            date: formatDate(cell.date, "long"),
                            status: cell.status.label,
                        })}
                        accessibilityRole="button"
                        accessibilityState={{ selected: cell.isSelected }}
                        onPress={() => onPressDay(cell.date)}
                        testID={`calendar-day-${cell.date}`}
                        style={({ pressed }) => [
                            styles.cell,
                            cell.status.surface && { backgroundColor: theme.colors[cell.status.surface] },
                            cell.status.estimated && styles.estimated,
                            cell.isSelected && {
                                borderColor: theme.colors.primary,
                                borderWidth: theme.borderWidth.thick,
                            },
                            cell.isToday && styles.today,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={[styles.day, cell.status.text && { color: theme.colors[cell.status.text] }]}>
                            {cell.day}
                        </Text>
                        {cell.status.hasEvent && cell.status.accent ? (
                            <View style={[styles.eventDot, { backgroundColor: theme.colors[cell.status.accent] }]} />
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}
