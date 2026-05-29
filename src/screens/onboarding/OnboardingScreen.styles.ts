import { StyleSheet } from "react-native";

import { colors, radii, type } from "../../theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 42,
    },
    brand: {
        alignItems: "center",
        gap: 10,
    },
    brandImage: {
        width: 176,
        height: 58,
    },
    brandText: {
        color: colors.muted,
        fontSize: type.body,
        fontWeight: "700",
    },
    progressTrack: {
        height: 5,
        marginHorizontal: 34,
        marginTop: 24,
        borderRadius: 999,
        backgroundColor: colors.surfaceSoft,
    },
    progressFill: {
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.primaryDeep,
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
    },
    body: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 23,
        textAlign: "center",
    },
    dateOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    option: {
        width: "47%",
        borderRadius: radii.lg,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    optionActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    optionTextActive: {
        color: colors.primaryInk,
    },
    optionMeta: {
        color: colors.muted,
        marginTop: 6,
        fontSize: type.small,
        fontWeight: "700",
    },
    segmentGroup: {
        flexDirection: "row",
        gap: 8,
    },
    segment: {
        flex: 1,
        minHeight: 48,
        borderRadius: radii.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    segmentActive: {
        backgroundColor: colors.primary,
    },
    segmentText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    segmentTextActive: {
        color: colors.primaryInk,
    },
    toggleRow: {
        minHeight: 58,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toggleRowActive: {
        backgroundColor: colors.primarySoft,
    },
    toggleText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    goals: {
        gap: 10,
    },
    goal: {
        flexDirection: "row",
        gap: 14,
        alignItems: "center",
        borderRadius: radii.lg,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    goalActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    goalText: {
        flex: 1,
    },
    goalTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    goalDescription: {
        color: colors.muted,
        fontSize: type.small,
        marginTop: 3,
    },
    reminders: {
        gap: 10,
    },
    reminder: {
        minHeight: 72,
        borderRadius: radii.lg,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reminderActive: {
        backgroundColor: colors.primarySoft,
    },
    reminderTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    reminderMeta: {
        color: colors.muted,
        marginTop: 3,
        fontWeight: "700",
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 26,
        gap: 10,
    },
    nextButton: {
        width: "100%",
    },
});

export default styles;
