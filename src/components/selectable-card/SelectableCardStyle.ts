import { createStyles } from "@/theme/createStyles";

export const useSelectableCardStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth, shadows } = theme;

    return {
        // Tarjeta suave: superficie + borde fino + sombra-susurro (no flotante).
        // Seleccionada = borde de marca 2px + tinte celeste + check. Sin ring.
        card: {
            position: "relative",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            borderRadius: radius.xl,
            backgroundColor: colors.surface,
            padding: spacing.lg,
            paddingRight: spacing.xl + spacing.md,
            ...shadows[1],
        },
        cardOn: {
            borderWidth: borderWidth.thick,
            borderColor: colors.primary,
            backgroundColor: colors.primarySubtle,
        },
        iconBubble: {
            width: 46,
            height: 46,
            borderRadius: radius.lg,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
        },
        iconBubbleOn: {
            backgroundColor: colors.primary,
        },
        textWrap: {
            flex: 1,
            gap: 3,
        },
        title: {
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.callout + 1,
            lineHeight: typography.sizes.callout + 6,
            color: colors.text,
        },
        subtitle: {
            ...typography.variant.caption,
            lineHeight: 17,
            color: colors.textMuted,
        },
        check: {
            position: "absolute",
            top: spacing.md,
            right: spacing.md,
            width: 24,
            height: 24,
            borderRadius: 999,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
    };
});
