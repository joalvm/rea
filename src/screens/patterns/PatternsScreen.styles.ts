import { StyleSheet } from "react-native";

import { colors, radii, type } from "../../theme";

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 58,
        paddingHorizontal: 18,
        paddingBottom: 32,
        gap: 22,
    },
    header: {
        gap: 10,
    },
    brandImage: {
        width: 118,
        height: 152,
        marginBottom: 4,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    title: {
        color: colors.ink,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "900",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    statusCard: {
        flexDirection: "row",
        gap: 14,
    },
    statusIcon: {
        width: 50,
        height: 50,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },
    statusBody: {
        flex: 1,
        gap: 5,
    },
    statusTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    statusText: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 22,
        fontWeight: "700",
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    chartCard: {
        gap: 18,
    },
    alertList: {
        gap: 12,
    },
    alertCard: {
        gap: 10,
    },
    alertHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    alertBadge: {
        minHeight: 28,
        paddingHorizontal: 10,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    alertBadgeText: {
        fontSize: type.small,
        fontWeight: "900",
    },
    alertTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    alertText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    barRow: {
        gap: 8,
    },
    barHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    barLabel: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    barValue: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    barTrack: {
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.surfaceSoft,
        overflow: "hidden",
    },
    barFill: {
        height: 12,
        borderRadius: 6,
    },
    insightCard: {
        gap: 14,
    },
    insightRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
    },
    insightIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    insightIconWatch: {
        backgroundColor: colors.periodSoft,
    },
    insightCopy: {
        flex: 1,
        gap: 4,
    },
    insightTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    insightText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    summaryList: {
        gap: 12,
    },
    summaryCard: {
        gap: 12,
    },
    summaryHeader: {
        gap: 4,
    },
    summaryTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    summaryMeta: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    summaryMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metricPill: {
        minHeight: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    metricPillWatch: {
        backgroundColor: colors.periodSoft,
    },
    metricPillText: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    metricPillTextWatch: {
        color: colors.period,
    },
    summaryFoot: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    symptomCard: {
        gap: 10,
    },
    symptomRow: {
        minHeight: 46,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    symptomLabel: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    symptomCount: {
        color: colors.primaryDeep,
        fontSize: type.body,
        fontWeight: "900",
    },
    emptyText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});

export default styles;
