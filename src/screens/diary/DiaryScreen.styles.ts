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
        gap: 8,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
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
    actions: {
        flexDirection: "row",
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingHorizontal: 10,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    rowCard: {
        flexDirection: "row",
        gap: 14,
    },
    rowIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    rowBody: {
        flex: 1,
        gap: 8,
    },
    rowHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    rowCopy: {
        flex: 1,
        gap: 4,
    },
    rowTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    rowMeta: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "700",
    },
    metrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metric: {
        backgroundColor: colors.surfaceSoft,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    metricLabel: {
        color: colors.muted,
        fontSize: type.tiny,
        fontWeight: "900",
    },
    metricValue: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
        marginTop: 2,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    note: {
        color: colors.ink,
        fontSize: type.small,
        lineHeight: 18,
    },
    dailyCard: {
        gap: 12,
    },
    dailyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    dailyHeaderRight: {
        alignItems: "flex-end",
        gap: 8,
    },
    dailyMetaGroup: {
        alignItems: "flex-end",
        gap: 6,
    },
    sourcePill: {
        color: colors.primaryDeep,
        backgroundColor: colors.primarySoft,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: type.tiny,
        fontWeight: "900",
        overflow: "hidden",
    },
    bleeding: {
        color: colors.period,
        fontSize: type.small,
        fontWeight: "900",
    },
    symptoms: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    symptom: {
        color: colors.primaryInk,
        backgroundColor: colors.primarySoft,
        borderRadius: radii.md,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: type.small,
        fontWeight: "800",
    },
    detailChip: {
        color: colors.ink,
        backgroundColor: colors.surfaceSoft,
        borderRadius: radii.md,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: type.small,
        fontWeight: "700",
    },
    empty: {
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.primarySoft,
    },
    emptyText: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 22,
        textAlign: "center",
        fontWeight: "700",
    },
});

export default styles;
