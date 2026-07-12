import { createStyles } from "@/theme/createStyles";

export const useSegmentedControlStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows } = theme;

    return {
        // Fondo primarySubtle agrupado. Segmento activo = superficie blanca
        // flotando con sombra-susurro (espejo de `.seg` del design-system).
        container: {
            flexDirection: "row",
            gap: spacing.xs,
            padding: spacing.xs + 1,
            borderRadius: radius.lg,
            backgroundColor: colors.primarySubtle,
        },
        item: {
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            gap: spacing.xs,
            backgroundColor: "transparent",
            borderRadius: radius.md,
            minHeight: theme.sizing.minTouch,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.xs,
        },
        itemOn: {
            backgroundColor: colors.background,
            ...shadows[1],
        },
        itemText: {
            fontFamily: typography.families.heading,
            fontWeight: "600",
            fontSize: typography.sizes.caption,
            color: colors.textMuted,
            textAlign: "center",
        },
        itemTextOn: {
            color: colors.primary,
        },
    };
});
