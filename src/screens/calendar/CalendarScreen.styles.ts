import { StyleSheet } from "react-native";

import { accents, colors, elevations, interactions, radii, screen, surfaces, type } from "@/theme";
import { PhaseKey } from "@/types/cycle.types";

/** Define tonos visuales por fase para celdas del calendario. */
export const phaseStyles: Record<PhaseKey, { ink: string }> = {
    menstrual: { ink: colors.period },
    follicular: { ink: colors.ink },
    fertile: { ink: colors.success },
    luteal: { ink: accents.luteal.ink },
};

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 44,
        paddingHorizontal: screen.horizontalPadding,
        paddingBottom: screen.bottomInset,
        gap: 14,
    },
    calendarPanel: {
        backgroundColor: surfaces.cardRaised,
        borderRadius: radii.lg,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 16,
        borderWidth: 1,
        borderColor: surfaces.borderStrong,
        ...elevations.card,
    },
    calendarHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingBottom: 14,
    },
    headerCopy: {
        flex: 1,
        gap: 4,
    },
    calendarLabel: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    monthTitle: {
        color: colors.ink,
        fontSize: 28,
        lineHeight: 32,
        fontWeight: "900",
    },
    monthActions: {
        flexDirection: "row",
        gap: 8,
    },
    monthButton: {
        width: 44,
        height: 44,
        borderRadius: radii.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: surfaces.cardSoft,
        borderWidth: 1,
        borderColor: accents.primary.border,
    },
    monthButtonPressed: {
        transform: [{ scale: interactions.pressScaleSoft }, { translateY: interactions.pressTranslateY }],
        opacity: interactions.pressOpacity,
    },
    weekHeader: {
        flexDirection: "row",
        paddingBottom: 10,
    },
    weekday: {
        flex: 1,
        textAlign: "center",
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: 8,
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingTop: 16,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minHeight: 32,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: surfaces.cardSoft,
        borderWidth: 1,
        borderColor: surfaces.border,
    },
    legendSwatch: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    legendSwatchObservedPeriod: {
        backgroundColor: colors.periodSoft,
        borderWidth: 1,
        borderColor: colors.period,
    },
    legendSwatchEstimatedPeriod: {
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.period,
    },
    legendSwatchFertile: {
        backgroundColor: accents.fertile.tint,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.fertile,
    },
    legendSwatchLuteal: {
        backgroundColor: accents.luteal.tint,
        borderWidth: 1,
        borderColor: accents.luteal.border,
    },
    legendText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    cell: {
        width: `${100 / 7}%`,
        minHeight: 56,
        alignItems: "center",
        justifyContent: "center",
    },
    cellMuted: {
        opacity: 0.32,
    },
    cellPressed: {
        transform: [{ scale: interactions.pressScaleSoft }, { translateY: interactions.pressTranslateY }],
        opacity: interactions.pressOpacity,
    },
    dayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    todayCircleFilled: {
        backgroundColor: colors.primaryDeep,
        borderWidth: 1,
        borderColor: colors.primaryDeep,
    },
    todayCircleOutlined: {
        borderWidth: 2,
        borderColor: colors.primaryDeep,
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
        backgroundColor: surfaces.cardRaised,
    },
    fertileCircle: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.fertile,
        backgroundColor: accents.fertile.tint,
    },
    lutealCircle: {
        borderWidth: 1,
        borderColor: accents.luteal.border,
        backgroundColor: accents.luteal.tint,
    },
    dayText: {
        color: colors.ink,
        fontSize: type.body - 2,
        fontWeight: "800",
    },
    dayTextMuted: {
        color: colors.muted,
    },
    dayTextTodayFilled: {
        color: colors.surface,
    },
    todayCard: {
        gap: 12,
    },
    todayCardHeader: {
        gap: 6,
    },
    todayCardTag: {
        alignSelf: "flex-start",
        minHeight: 26,
        borderRadius: 13,
        paddingHorizontal: 10,
        paddingVertical: 4,
        overflow: "hidden",
        backgroundColor: accents.primary.tint,
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    todayCardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    todayCardText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});

export default styles;
