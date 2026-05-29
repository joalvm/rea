import { StyleSheet } from "react-native";

import { colors, type } from "../../theme";

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 58,
        paddingHorizontal: 18,
        paddingBottom: 36,
        gap: 18,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    headerCopy: {
        flex: 1,
        gap: 6,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    title: {
        color: colors.ink,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "900",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 20,
    },
    summaryCard: {
        gap: 12,
        backgroundColor: colors.surfaceSoft,
    },
    card: {
        gap: 12,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    summaryText: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    cardBody: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    badge: {
        color: colors.primaryDeep,
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.tiny,
        fontWeight: "900",
        overflow: "hidden",
    },
    metaLine: {
        color: colors.muted,
        fontSize: type.small,
        lineHeight: 18,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        color: colors.ink,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.small,
        overflow: "hidden",
    },
    detailChip: {
        color: colors.primaryDeep,
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.small,
        fontWeight: "800",
        overflow: "hidden",
    },
    softText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 20,
    },
    note: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 21,
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    tipIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    tipText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 20,
    },
    momentRow: {
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    momentCopy: {
        gap: 4,
    },
    momentTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    momentMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metric: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "700",
    },
    actionButton: {
        marginTop: 4,
    },
});

export default styles;
