import { createStyles } from "@/theme/createStyles";

export const useSelectableCardStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        card: {
            position: "relative",
            borderWidth: borderWidth.thick,
            borderColor: colors.borderStrong,
            borderRadius: radius.xl,
            backgroundColor: colors.surface,
            padding: spacing.lg,
            gap: spacing.xs + 2,
        },
        cardOn: {
            borderColor: colors.primaryPressed,
            backgroundColor: colors.primarySubtle,
        },
        iconBubble: {
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xs,
        },
        iconBubbleOn: {
            backgroundColor: colors.primary,
        },
        title: {
            ...typography.variant.bodyStrong,
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.callout + 0.5,
            color: colors.text,
        },
        subtitleWrap: {
            height: 36,
            justifyContent: "center",
        },
        subtitle: {
            ...typography.variant.caption,
            lineHeight: 16,
            color: colors.textMuted,
        },
        check: {
            position: "absolute",
            top: spacing.md,
            right: spacing.md,
            width: 22,
            height: 22,
            borderRadius: 999,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
    };
});
