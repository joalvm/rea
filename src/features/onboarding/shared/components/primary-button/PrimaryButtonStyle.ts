import { createStyles } from "@/theme/createStyles";

export const usePrimaryButtonStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows } = theme;

    return {
        // CTA primario = relleno celeste sólido + texto navy (onPrimary). Sin borde.
        // La forma la define el relleno + una sombra-susurro tintada de marca.
        primary: {
            minHeight: theme.sizing.controlLg, // 56
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: spacing.sm,
            paddingHorizontal: spacing.xl,
            ...shadows[2],
            shadowColor: colors.primary,
            shadowOpacity: 0.35,
        },
        primaryText: {
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.title,
            lineHeight: typography.sizes.title + 4,
            color: colors.onPrimary,
        },
        primaryPressed: {
            opacity: theme.state.pressedOpacity,
            transform: [{ scale: theme.state.pressedScale }],
        },
        primaryDisabled: {
            backgroundColor: colors.surfaceSunken,
            shadowOpacity: 0,
            elevation: 0,
        },
        primaryDisabledText: {
            color: colors.textMuted,
        },
        // CTA secundario = ghost/text, sin relleno.
        secondary: {
            minHeight: theme.sizing.minTouch,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
        },
        secondaryPressed: {
            opacity: 0.6,
        },
        secondaryDisabled: {
            opacity: theme.state.disabledOpacity,
        },
        secondaryText: {
            ...typography.variant.bodyStrong,
            fontFamily: typography.families.heading,
            color: colors.textMuted,
        },
    };
});
