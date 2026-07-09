import { createStyles } from "@/theme/createStyles";

export const useSegmentedControlStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows } = theme;

    return {
        // Pill agrupado sobre tinte de marca. Segmento activo = superficie blanca
        // flotando con sombra-susurro. Sin bordes (la elevación define el activo).
        container: {
            flexDirection: "row",
            gap: spacing.xs,
            padding: spacing.xs + 1,
            borderRadius: radius.pill,
            backgroundColor: colors.primaryTint,
        },
        item: {
            flex: 1,
            backgroundColor: "transparent",
            borderRadius: radius.pill,
            minHeight: theme.sizing.controlMd - 4,
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.md,
            alignItems: "center",
            justifyContent: "center",
        },
        itemOn: {
            backgroundColor: colors.background,
            ...shadows[1],
        },
        itemText: {
            fontFamily: theme.typography.families.heading,
            fontSize: typography.sizes.subhead + 1,
            color: colors.textMuted,
        },
        itemTextOn: {
            color: colors.link,
        },
    };
});
