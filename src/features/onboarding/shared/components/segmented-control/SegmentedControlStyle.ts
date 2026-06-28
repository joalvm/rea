import { createStyles } from "@/theme/createStyles";

export const useSegmentedControlStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        container: {
            flexDirection: "row",
            gap: spacing.xs,
            padding: spacing.xs,
            borderRadius: radius.pill,
            backgroundColor: colors.surfaceSunken,
        },
        item: {
            flex: 1,
            borderWidth: borderWidth.thick,
            borderColor: "transparent",
            backgroundColor: "transparent",
            borderRadius: radius.pill,
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.md,
            alignItems: "center",
            justifyContent: "center",
        },
        itemOn: {
            backgroundColor: colors.surface,
            borderColor: colors.link,
        },
        itemText: {
            ...typography.variant.subhead,
            color: colors.textMuted,
        },
        itemTextOn: {
            color: colors.text,
        },
    };
});
