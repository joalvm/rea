import { StyleSheet } from "react-native";

import { accents, colors, radii, screen, surfaces, type } from "@/theme";

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: screen.topInset,
        paddingHorizontal: screen.horizontalPadding,
        paddingBottom: screen.bottomInset,
        gap: screen.blockGap,
    },
    statusCard: {
        flexDirection: "row",
        gap: 14,
    },
    statusIcon: {
        width: 50,
        height: 50,
        borderRadius: radii.md,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: accents.primary.border,
        alignItems: "center",
        justifyContent: "center",
    },
    statusBody: {
        flex: 1,
        gap: 5,
    },
    statusMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
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
        gap: screen.sectionGap,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        lineHeight: screen.sectionTitleLineHeight,
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
        backgroundColor: surfaces.cardSoft,
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
        backgroundColor: surfaces.cardSoft,
        borderWidth: 1,
        borderColor: accents.primary.border,
        alignItems: "center",
        justifyContent: "center",
    },
    insightIconWatch: {
        backgroundColor: accents.period.tint,
        borderColor: accents.period.border,
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
        backgroundColor: surfaces.cardSoft,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    metricPillWatch: {
        backgroundColor: accents.period.tint,
    },
    metricPillText: {
        color: colors.primaryInk,
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
    editorialCard: {
        gap: 8,
    },
    editorialTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    editorialBody: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    editorialSource: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    symptomCard: {
        gap: 10,
    },
    symptomRow: {
        minHeight: 46,
        borderRadius: radii.md,
        backgroundColor: surfaces.cardSoft,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: surfaces.borderSoft,
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
