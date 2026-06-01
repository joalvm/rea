import { StyleSheet } from "react-native";

import { accents, colors, interactions, radii, screen, surfaces, type } from "@/theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 54,
    },
    header: {
        paddingHorizontal: screen.horizontalPadding,
        paddingBottom: 14,
    },
    content: {
        gap: 14,
        paddingHorizontal: screen.horizontalPadding,
        paddingTop: 8,
        paddingBottom: 34,
    },
    row: {
        minHeight: 92,
        borderRadius: radii.lg,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    pressed: {
        transform: [{ scale: interactions.pressScale }, { translateY: interactions.pressTranslateY }],
        opacity: interactions.pressOpacity,
    },
    rowIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: surfaces.cardSoft,
        borderWidth: 1,
        borderColor: accents.primary.border,
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
        color: colors.primaryInk,
        fontSize: type.tiny,
        fontWeight: "900",
        backgroundColor: accents.primary.tint,
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
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: accents.primary.border,
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
        backgroundColor: accents.period.tint,
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
        backgroundColor: accents.period.tint,
        alignItems: "center",
        justifyContent: "center",
    },
    resetButtonText: {
        color: colors.danger,
        fontSize: type.body,
        fontWeight: "900",
    },
    referenceNote: {
        alignSelf: "center",
        color: colors.muted,
        fontSize: type.tiny,
        lineHeight: 18,
        maxWidth: screen.maxTextWidth,
        paddingHorizontal: 8,
        textAlign: "center",
    },
});

export default styles;
