import { createStyles } from "@/theme/createStyles";

export const useIntentStyles = createStyles((theme) => {
    const { spacing, typography, colors } = theme;

    return {
        header: {
            gap: 10,
        },
        masters: {
            gap: spacing.md,
            marginTop: spacing.xl,
        },
        modifiers: {
            marginTop: spacing["2xl"],
        },
        modifierLabel: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.text,
            marginBottom: spacing.xs,
        },
        modifierHint: {
            ...typography.variant.caption,
            color: colors.textMuted,
            marginBottom: spacing.md,
        },
        modifierList: {
            gap: spacing.sm,
        },
    };
});
