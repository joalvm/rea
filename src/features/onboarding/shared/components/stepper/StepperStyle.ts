import { createStyles } from "@/theme/createStyles";

export const useStepperStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth, sizing } = theme;

    return {
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
            borderWidth: borderWidth.thick,
            borderColor: colors.borderStrong,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            padding: spacing.xs + 2,
        },
        button: {
            width: sizing.controlSm,
            height: sizing.controlSm,
            borderRadius: radius.md,
            borderWidth: borderWidth.thick,
            borderColor: colors.borderStrong,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonPressed: {
            opacity: 0.6,
        },
        buttonDisabled: {
            opacity: 0.4,
        },
        valueWrap: {
            alignItems: "center",
        },
        value: {
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.h2 + 4,
            color: colors.text,
            lineHeight: typography.sizes.h2 + 6,
            textAlign: "center",
        },
        unit: {
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.overline,
            color: colors.textMuted,
            textAlign: "center",
            marginTop: 2,
        },
    };
});
