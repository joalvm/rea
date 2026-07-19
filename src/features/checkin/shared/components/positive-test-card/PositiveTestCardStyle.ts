import { createStyles } from "@/theme/createStyles";

export const usePositiveTestCardStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth, shadows } = theme;

    return {
        overlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.xl,
        },
        // Espejo de `.test-card` del design-system: fondo primarySubtle, borde
        // primaryTint, radius xl, padding generoso, centrado.
        card: {
            width: "100%",
            maxWidth: 360,
            backgroundColor: colors.primarySubtle,
            borderWidth: borderWidth.thin,
            borderColor: colors.primaryTint,
            borderRadius: radius.xl,
            padding: spacing.xl,
            alignItems: "center",
            gap: spacing.sm,
        },
        // Burbuja blanca con icono ink2 (espejo `.test-icon`), no primary.
        iconBubble: {
            width: 48,
            height: 48,
            borderRadius: radius.lg,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xs,
        },
        title: {
            ...typography.variant.h3,
            fontFamily: typography.families.heading,
            color: colors.text,
            textAlign: "center",
        },
        lead: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "center",
        },
        hint: {
            ...typography.variant.callout,
            color: colors.textMuted,
            textAlign: "center",
            marginTop: spacing.md,
        },
        // Espejo `.btn` / `.btn.ghost`: pill 999, 54px alto, heading bold.
        cta: {
            width: "100%",
            minHeight: 54,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            marginTop: spacing.xs,
        },
        ctaPrimary: {
            backgroundColor: colors.primary,
            ...shadows[1],
        },
        ctaPrimaryText: {
            fontFamily: typography.families.heading,
            fontWeight: "700",
            fontSize: typography.sizes.body,
            color: colors.onPrimary,
        },
        ctaSecondary: {
            backgroundColor: colors.primaryTint,
        },
        ctaSecondaryText: {
            fontFamily: typography.families.heading,
            fontWeight: "700",
            fontSize: typography.sizes.body,
            color: colors.primary,
        },
        disclaimer: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.xs,
            marginTop: spacing.sm,
        },
        disclaimerText: {
            ...typography.variant.caption,
            color: colors.textMuted,
            flex: 1,
        },
    };
});
