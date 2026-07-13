import { createStyles } from "@/theme/createStyles";

export const useCheckinIntroStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, sizing } = theme;

    return {
        chipsWrap: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        empty: {
            ...typography.variant.body,
            color: colors.textMuted,
            textAlign: "center",
            paddingVertical: spacing.xl,
        },
        intensityWrap: {
            gap: spacing.sm,
            marginTop: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
        },
        intensityRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        intensityLabel: {
            ...typography.variant.subhead,
            color: colors.text,
            flex: 1,
        },
        intensityDots: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        intensityDot: {
            fontSize: typography.sizes.body,
            color: colors.border,
        },
        intensityDotOn: {
            color: colors.primary,
        },
        // Reservado por si el hero heredado se reincorpora; mantiene referencia
        // de tokens para futuras iteraciones del intro.
        heroWrap: {
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.xl,
        },
        heroBlob: {
            width: sizing.iconXl * 2,
            height: sizing.iconXl * 2,
            borderRadius: radius.xl,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            ...typography.variant.h1,
            fontFamily: typography.families.heading,
            color: colors.text,
            textAlign: "center",
        },
        lead: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "center",
            maxWidth: sizing.readableMaxWidth,
        },
    };
});
