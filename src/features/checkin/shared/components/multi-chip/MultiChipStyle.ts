import { createStyles } from "@/theme/createStyles";

export const useMultiChipStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth, sizing } = theme;

    return {
        chip: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            minHeight: sizing.minTouch,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        chipOn: {
            borderWidth: borderWidth.thick,
            borderColor: colors.primary,
            backgroundColor: colors.primarySubtle,
        },
        checkDot: {
            width: 18,
            height: 18,
            borderRadius: 999,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        iconWrap: {
            alignItems: "center",
            justifyContent: "center",
        },
        label: {
            ...typography.variant.subhead,
            color: colors.text,
        },
        labelOn: {
            color: colors.text,
            fontFamily: typography.families.heading,
        },
        dots: {
            flexDirection: "row",
            gap: 3,
            marginLeft: spacing.xs,
        },
        dot: {
            width: 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: colors.border,
        },
        dotOn: {
            backgroundColor: colors.primary,
        },
    };
});
