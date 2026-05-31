import { StyleSheet } from "react-native";

import { accents, colors, screen, surfaces, type } from "@/theme";

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: screen.topInset,
        paddingHorizontal: screen.horizontalPadding,
        paddingBottom: 36,
        gap: 18,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: accents.primary.border,
    },
    summaryCard: {
        gap: 12,
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
        color: colors.primaryInk,
        backgroundColor: surfaces.cardRaised,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.tiny,
        fontWeight: "900",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: surfaces.borderStrong,
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
        backgroundColor: surfaces.cardSoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.small,
        overflow: "hidden",
    },
    detailChip: {
        color: colors.primaryInk,
        backgroundColor: accents.primary.tint,
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
        borderWidth: 1,
        borderColor: surfaces.borderStrong,
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
