import { StyleSheet } from "react-native";

import { accents, colors, radii, screen, surfaces, type } from "@/theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    brand: {
        alignItems: "center",
        gap: 10,
    },
    brandImage: {
        width: 176,
        height: 58,
    },
    progressTrack: {
        height: 6,
        marginHorizontal: 34,
        marginTop: 24,
        borderRadius: 999,
        backgroundColor: surfaces.cardSoft,
        borderWidth: 1,
        borderColor: surfaces.borderSoft,
    },
    progressFill: {
        height: 6,
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: screen.horizontalPadding,
        paddingVertical: 18,
        justifyContent: "center",
    },
    body: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 23,
        textAlign: "center",
    },
    helperText: {
        color: colors.primaryInk,
        fontSize: type.small,
        fontWeight: "700",
        textAlign: "center",
    },
    datePickerRow: {
        flexDirection: "row",
        gap: 10,
    },
    datePickerMonth: {
        flex: 1.25,
    },
    datePickerDay: {
        flex: 0.75,
    },
    segmentGroup: {
        flexDirection: "row",
        gap: 8,
    },
    segment: {
        flex: 1,
        minHeight: 44,
        borderRadius: radii.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
    },
    segmentActive: {
        backgroundColor: accents.primary.tint,
        borderColor: accents.primary.border,
    },
    segmentText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    segmentTextActive: {
        color: colors.primary,
    },
    toggleRow: {
        minHeight: 52,
        borderRadius: radii.lg,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toggleRowActive: {
        backgroundColor: accents.primary.tint,
        borderColor: accents.primary.border,
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
        gap: 12,
        alignItems: "center",
        borderRadius: radii.lg,
        padding: 14,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
    },
    goalActive: {
        borderColor: accents.primary.border,
        backgroundColor: accents.primary.tint,
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
        minHeight: 64,
        borderRadius: radii.lg,
        padding: 14,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reminderActive: {
        backgroundColor: accents.primary.tint,
        borderColor: accents.primary.border,
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
        paddingHorizontal: screen.horizontalPadding,
        paddingTop: 12,
        paddingBottom: 26,
        gap: 12,
    },
    footerRow: {
        flexDirection: "row",
        gap: 12,
    },
    footerAction: {
        flex: 1,
    },
    footerNote: {
        color: colors.muted,
        fontSize: type.small,
        lineHeight: 19,
        textAlign: "center",
    },
    nextButton: {
        width: "100%",
    },
});

export default styles;
