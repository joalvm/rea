import { createStyles } from "@/theme/createStyles";

export const useStepperStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography } = theme;

    return {
        // − valor + compacto, sin contenedor. Botones = cuadro de tinte celeste.
        container: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        button: {
            width: 44,
            height: 44,
            borderRadius: radius.lg,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonPressed: {
            opacity: theme.state.pressedOpacity,
            transform: [{ scale: theme.state.pressedScale }],
        },
        buttonDisabled: {
            opacity: theme.state.disabledOpacity,
        },
        valueWrap: {
            minWidth: 52,
            alignItems: "center",
        },
        value: {
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.h2,
            color: colors.text,
            lineHeight: typography.sizes.h2 + 4,
            textAlign: "center",
        },
        unit: {
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.overline,
            color: colors.textMuted,
            textAlign: "center",
            marginTop: 1,
        },
    };
});
