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
    brandText: {
        color: colors.primaryInk,
        fontSize: type.body,
        fontWeight: "700",
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
        backgroundColor: colors.primaryDeep,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: screen.horizontalPadding,
        paddingVertical: 24,
        justifyContent: "center",
    },
    body: {
        color: colors.primaryInk,
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
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
    },
    optionActive: {
        backgroundColor: surfaces.cardRaised,
        borderColor: accents.primary.border,
    },
    optionText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    optionTextActive: {
        color: colors.primaryDeep,
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
        color: colors.primaryInk,
    },
    toggleRow: {
        minHeight: 58,
        borderRadius: radii.lg,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        paddingHorizontal: 16,
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
        gap: 14,
        alignItems: "center",
        borderRadius: radii.lg,
        padding: 16,
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
        minHeight: 72,
        borderRadius: radii.lg,
        padding: 16,
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
    nextButton: {
        width: "100%",
    },
});

export default styles;
