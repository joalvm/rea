import { createStyles } from "@/theme/createStyles";

export const usePrimaryButtonStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        primary: {
            minHeight: 52,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thick,
            borderColor: colors.link,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: spacing.sm,
            paddingHorizontal: spacing.xl,
        },
        primaryText: {
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.body,
            lineHeight: typography.sizes.body + 4,
            color: colors.link,
        },
        primaryPressed: {
            backgroundColor: colors.primaryTint,
        },
        primaryDisabled: {
            borderColor: colors.borderStrong,
            opacity: 0.4,
        },
        primaryDisabledText: {
            color: colors.textMuted,
        },
        secondary: {
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
        },
        secondaryPressed: {
            opacity: 0.6,
        },
        secondaryDisabled: {
            opacity: 0.4,
        },
        secondaryText: {
            ...typography.variant.bodyStrong,
            color: colors.textMuted,
        },
    };
});
