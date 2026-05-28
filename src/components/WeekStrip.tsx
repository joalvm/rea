import { StyleSheet, Text, View } from "react-native";

import { colors, type } from "../theme";
import { CycleSnapshot } from "../types";

interface WeekStripProps {
    week: CycleSnapshot["week"];
    palette?: {
        weekdayColor?: string;
        todayWeekdayColor?: string;
        dayTextColor?: string;
        todayBackgroundColor?: string;
        todayDayTextColor?: string;
    };
}

const defaultPalette = {
    weekdayColor: colors.primaryInk,
    todayWeekdayColor: colors.primaryInk,
    dayTextColor: colors.ink,
    todayBackgroundColor: colors.primaryDeep,
    todayDayTextColor: colors.surface,
};

export function WeekStrip({ week, palette }: WeekStripProps) {
    const resolvedPalette = { ...defaultPalette, ...palette };

    return (
        <View style={styles.wrap}>
            {week.map((day) => (
                <View key={day.iso} style={styles.day}>
                    <Text
                        style={[
                            styles.weekday,
                            { color: resolvedPalette.weekdayColor },
                            day.isToday && styles.todayText,
                            day.isToday && { color: resolvedPalette.todayWeekdayColor },
                        ]}
                    >
                        {day.weekday}
                    </Text>
                    <View
                        style={[
                            styles.circle,
                            day.isToday && styles.todayCircle,
                            day.isToday && { backgroundColor: resolvedPalette.todayBackgroundColor },
                            day.isPeriod &&
                                day.periodSource === "observed" &&
                                !day.isToday &&
                                styles.observedPeriodCircle,
                            day.isPeriod &&
                                day.periodSource === "estimated" &&
                                !day.isToday &&
                                styles.estimatedPeriodCircle,
                            day.isFertile && !day.isToday && styles.fertileCircle,
                        ]}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                { color: resolvedPalette.dayTextColor },
                                day.isToday && styles.todayDayText,
                                day.isToday && { color: resolvedPalette.todayDayTextColor },
                            ]}
                        >
                            {day.day}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    day: {
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    weekday: {
        color: colors.primaryInk,
        opacity: 0.56,
        fontSize: type.tiny,
        fontWeight: "800",
    },
    todayText: {
        opacity: 1,
    },
    circle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    todayCircle: {
        backgroundColor: colors.primaryDeep,
    },
    observedPeriodCircle: {
        backgroundColor: colors.periodSoft,
        borderWidth: 1,
        borderColor: colors.period,
    },
    estimatedPeriodCircle: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.period,
    },
    fertileCircle: {
        backgroundColor: colors.fertileSoft,
        borderWidth: 1,
        borderColor: colors.fertile,
    },
    dayText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    todayDayText: {
        color: colors.surface,
    },
});
