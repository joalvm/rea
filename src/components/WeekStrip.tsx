import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, type } from "../theme";
import { CycleSnapshot, PhaseKey } from "../types/cycle.types";

export type WeekStripDay = CycleSnapshot["week"][number] & {
    phase: PhaseKey;
    isFuture: boolean;
};

interface WeekStripProps {
    weeks: WeekStripDay[][];
    selectedIso?: string;
    onSelectDay?: (iso: string) => void;
    initialPage?: number;
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

export function WeekStrip({ weeks, selectedIso, onSelectDay, initialPage = 0, palette }: WeekStripProps) {
    const resolvedPalette = { ...defaultPalette, ...palette };
    const scrollRef = useRef<ScrollView>(null);
    const [pageWidth, setPageWidth] = useState(0);

    useEffect(() => {
        if (!pageWidth) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ animated: false, x: initialPage * pageWidth });
        });

        return () => cancelAnimationFrame(frame);
    }, [initialPage, pageWidth]);

    return (
        <View style={styles.viewport} onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}>
            <ScrollView
                bounces={false}
                contentContainerStyle={styles.pages}
                decelerationRate="fast"
                horizontal
                pagingEnabled
                ref={scrollRef}
                scrollEnabled={weeks.length > 1}
                showsHorizontalScrollIndicator={false}
            >
                {weeks.map((week, index) => (
                    <View
                        key={`${week[0]?.iso ?? index}`}
                        style={[styles.wrap, pageWidth ? { width: pageWidth } : null]}
                    >
                        {week.map((day) => (
                            <Pressable
                                accessibilityLabel={`Ver ${day.iso}`}
                                accessibilityRole="button"
                                disabled={!onSelectDay}
                                key={day.iso}
                                onPress={() => onSelectDay?.(day.iso)}
                                style={styles.day}
                            >
                                {({ pressed }) => {
                                    const isSelected = selectedIso === day.iso;
                                    const tone = getDayTone(day, resolvedPalette);

                                    return (
                                        <>
                                            <Text
                                                style={[
                                                    styles.weekday,
                                                    { color: tone.weekdayColor },
                                                    day.isToday && styles.todayText,
                                                    isSelected && styles.selectedWeekday,
                                                    day.isFuture && styles.futureWeekday,
                                                    pressed && styles.pressed,
                                                ]}
                                            >
                                                {day.weekday}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.circle,
                                                    {
                                                        backgroundColor: tone.circleBackground,
                                                        borderColor: tone.circleBorderColor,
                                                    },
                                                    tone.circleBorderWidth
                                                        ? { borderWidth: tone.circleBorderWidth }
                                                        : null,
                                                    tone.circleBorderStyle
                                                        ? { borderStyle: tone.circleBorderStyle }
                                                        : null,
                                                    day.isFuture && styles.futureCircle,
                                                    isSelected && !day.isToday && styles.selectedCircle,
                                                    isSelected &&
                                                        !day.isToday && {
                                                            borderColor: resolvedPalette.todayBackgroundColor,
                                                        },
                                                    pressed && styles.pressed,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dayText,
                                                        { color: tone.dayTextColor },
                                                        day.isToday && styles.todayDayText,
                                                        day.isFuture && styles.futureDayText,
                                                    ]}
                                                >
                                                    {day.day}
                                                </Text>
                                            </View>
                                        </>
                                    );
                                }}
                            </Pressable>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    viewport: {
        marginHorizontal: -4,
    },
    pages: {
        alignItems: "stretch",
    },
    wrap: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        paddingHorizontal: 4,
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
    futureWeekday: {
        opacity: 0.42,
    },
    todayText: {
        opacity: 1,
    },
    selectedWeekday: {
        opacity: 1,
    },
    circle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    futureCircle: {
        opacity: 0.7,
    },
    selectedCircle: {
        borderWidth: 2,
    },
    dayText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    futureDayText: {
        opacity: 0.8,
    },
    todayDayText: {
        color: colors.surface,
    },
    pressed: {
        opacity: 0.88,
    },
});

function getDayTone(
    day: WeekStripDay,
    palette: {
        weekdayColor?: string;
        todayWeekdayColor?: string;
        dayTextColor?: string;
        todayBackgroundColor?: string;
        todayDayTextColor?: string;
    },
) {
    if (day.isToday) {
        return {
            weekdayColor: palette.todayWeekdayColor ?? colors.primaryInk,
            dayTextColor: palette.todayDayTextColor ?? colors.surface,
            circleBackground: palette.todayBackgroundColor ?? colors.primaryDeep,
            circleBorderColor: palette.todayBackgroundColor ?? colors.primaryDeep,
            circleBorderWidth: 0,
            circleBorderStyle: "solid" as const,
        };
    }

    if (day.phase === "menstrual") {
        return {
            weekdayColor: day.isFuture ? "rgba(219,79,102,0.54)" : colors.danger,
            dayTextColor: day.isFuture ? "rgba(122,73,87,0.72)" : "#7A4957",
            circleBackground:
                day.periodSource === "observed"
                    ? day.isFuture
                        ? "rgba(255,231,238,0.6)"
                        : colors.periodSoft
                    : day.isFuture
                      ? "rgba(255,255,255,0.75)"
                      : colors.surface,
            circleBorderColor: day.isFuture ? "rgba(219,79,102,0.3)" : colors.period,
            circleBorderWidth: 1,
            circleBorderStyle: day.periodSource === "estimated" ? ("dashed" as const) : ("solid" as const),
        };
    }

    if (day.phase === "fertile") {
        return {
            weekdayColor: day.isFuture ? "rgba(61,190,134,0.54)" : colors.success,
            dayTextColor: day.isFuture ? "rgba(61,111,95,0.72)" : "#2E8A62",
            circleBackground: day.isFuture ? "rgba(232,248,242,0.66)" : colors.fertileSoft,
            circleBorderColor: day.isFuture ? "rgba(61,190,134,0.28)" : colors.fertile,
            circleBorderWidth: 1,
            circleBorderStyle: "solid" as const,
        };
    }

    if (day.phase === "follicular") {
        return {
            weekdayColor: day.isFuture ? "rgba(8,124,155,0.4)" : colors.primaryDeep,
            dayTextColor: day.isFuture ? "rgba(5,88,111,0.64)" : colors.primaryInk,
            circleBackground: day.isFuture ? "rgba(239,249,253,0.68)" : colors.primarySoft,
            circleBorderColor: day.isFuture ? "rgba(8,124,155,0.12)" : "rgba(8,124,155,0.18)",
            circleBorderWidth: 1,
            circleBorderStyle: "solid" as const,
        };
    }

    return {
        weekdayColor: day.isFuture ? "rgba(122,94,201,0.42)" : "#7A5EC9",
        dayTextColor: day.isFuture ? "rgba(91,76,126,0.68)" : "#5B4C7E",
        circleBackground: day.isFuture ? "rgba(243,239,250,0.7)" : colors.lutealSoft,
        circleBorderColor: day.isFuture ? "rgba(122,94,201,0.12)" : "rgba(122,94,201,0.18)",
        circleBorderWidth: 1,
        circleBorderStyle: "solid" as const,
    };
}
