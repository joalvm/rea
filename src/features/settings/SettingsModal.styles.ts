import { StyleSheet } from "react-native";

import { colors, radii, type } from "@/theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 54,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    headerCopy: {
        flex: 1,
        minWidth: 0,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    title: {
        color: colors.ink,
        flexShrink: 1,
        fontSize: type.title,
        fontWeight: "900",
        lineHeight: 28,
        marginTop: 2,
    },
    content: {
        gap: 14,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 34,
    },
    row: {
        minHeight: 92,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.08)",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    pressed: {
        transform: [{ scale: 0.985 }],
    },
    rowIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    rowBody: {
        flex: 1,
        minWidth: 0,
        gap: 5,
    },
    rowTitleLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rowMeta: {
        color: colors.primaryDeep,
        fontSize: type.tiny,
        fontWeight: "900",
        backgroundColor: colors.primarySoft,
        borderRadius: 999,
        overflow: "hidden",
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    cardText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    privacyCard: {
        flexDirection: "row",
        gap: 13,
        alignItems: "flex-start",
    },
    privacyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    privacyCopy: {
        flex: 1,
        gap: 6,
    },
    resetCard: {
        gap: 14,
    },
    resetHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
    },
    resetIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.periodSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    resetCopy: {
        flex: 1,
        gap: 4,
    },
    resetButton: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.periodSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    resetButtonText: {
        color: colors.danger,
        fontSize: type.body,
        fontWeight: "900",
    },
});

export default styles;
