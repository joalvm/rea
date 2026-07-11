import { createStyles } from "@/theme/createStyles";

export const useChoiceCardStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        card: {
            flexGrow: 1,
            minHeight: 88,
            gap: spacing.xs,
            borderWidth: borderWidth.thin + borderWidth.thin * 0.5,
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            padding: spacing.md,
            alignItems: "center",
            justifyContent: "center",
        },
        cardOn: {
            borderWidth: borderWidth.thick,
            borderColor: colors.primary,
            backgroundColor: colors.primarySubtle,
        },
        iconBubble: {
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
        },
        iconBubbleOn: {
            backgroundColor: colors.primary,
        },
        label: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.text,
            textAlign: "center",
        },
        description: {
            ...typography.variant.caption,
            color: colors.textMuted,
            textAlign: "center",
        },
    };
});
