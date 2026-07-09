import { createStyles } from "@/theme/createStyles";

export const useHomeStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            paddingBottom: spacing["5xl"],
        },
        body: {
            paddingHorizontal: spacing["2xl"],
            gap: spacing.lg,
            marginTop: spacing.xl,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            padding: spacing.xl,
            gap: spacing.sm,
            ...shadows[1],
        },
        cardTitle: {
            ...typography.variant.h3,
            color: colors.text,
        },
        cardText: {
            ...typography.variant.callout,
            color: colors.textSecondary,
        },
        secondaryBtn: {
            minHeight: sizing.controlMd,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        secondaryBtnText: {
            ...typography.variant.bodyStrong,
            color: colors.link,
        },
        previewBlock: {
            marginTop: spacing.sm,
            gap: spacing.sm,
        },
        previewLabel: {
            ...typography.variant.overline,
            color: colors.textMuted,
        },
        previewChips: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        previewChip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
        },
        previewChipText: {
            ...typography.variant.subhead,
            color: colors.textSecondary,
        },
        pressed: {
            opacity: 0.85,
        },
    };
});
