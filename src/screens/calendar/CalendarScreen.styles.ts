import { StyleSheet } from "react-native";

import { colors, radii, type } from "../../theme";
import { PhaseKey } from "../../types/cycle.types";

/** Define tonos visuales por fase para celdas del calendario. */
export const phaseStyles: Record<PhaseKey, { ink: string; line: string }> = {
    menstrual: { ink: colors.period, line: "rgba(248,111,143,0.54)" },
    follicular: { ink: colors.ink, line: "rgba(8,124,155,0.08)" },
    fertile: { ink: colors.success, line: "rgba(61,190,134,0.42)" },
    luteal: { ink: "#7A5EC9", line: "rgba(122,94,201,0.34)" },
};

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 32,
        gap: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    kicker: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
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
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    title: {
        color: colors.ink,
        fontSize: 28,
        fontWeight: "900",
        marginTop: 4,
    },
    summaryCard: {
        gap: 14,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    summaryTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    summaryText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
        marginTop: 4,
        maxWidth: 240,
    },
    summaryBadge: {
        minHeight: 32,
        borderRadius: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceSoft,
        borderWidth: 1,
        borderColor: colors.line,
    },
    summaryBadgeText: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    summaryMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    calendarPanel: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.line,
    },
    weekHeader: {
        flexDirection: "row",
        paddingBottom: 8,
    },
    weekday: {
        width: `${100 / 7}%`,
        textAlign: "center",
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingTop: 10,
    },
    cell: {
        width: `${100 / 7}%`,
        minHeight: 58,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    cellMuted: {
        opacity: 0.28,
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        backgroundColor: colors.surface,
    },
    fertileCircle: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.fertile,
    },
    dayText: {
        color: colors.ink,
        fontSize: type.body - 2,
        fontWeight: "800",
    },
    dayTextMuted: {
        color: colors.muted,
    },
    dayTextToday: {
        color: colors.surface,
    },
    periodBadge: {
        position: "absolute",
        top: 5,
        right: 5,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.period,
    },
    loggedBadge: {
        position: "absolute",
        left: 1,
        top: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primaryDeep,
    },
    loggedBadgeToday: {
        backgroundColor: colors.surface,
    },
    phaseLine: {
        width: 24,
        height: 3,
        borderRadius: 2,
    },
    phaseLineMuted: {
        opacity: 0.4,
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    legendItem: {
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        backgroundColor: colors.surfaceSoft,
        borderRadius: 16,
        paddingHorizontal: 11,
        minHeight: 32,
        borderWidth: 1,
        borderColor: colors.line,
    },
    legendText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    panel: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: 18,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.line,
    },
    panelTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    panelText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});

export default styles;
