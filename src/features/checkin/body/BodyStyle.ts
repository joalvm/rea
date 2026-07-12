import { createStyles } from "@/theme/createStyles";

export const useBodyStyles = createStyles((theme) => {
    const { colors, spacing, typography } = theme;

    return {
        valueRow: {
            flexDirection: "row",
            alignItems: "baseline",
            gap: spacing.xs,
            marginTop: spacing.sm,
        },
        valueInput: {
            fontFamily: typography.families.heading,
            fontWeight: "700",
            fontSize: 34,
            color: colors.text,
            minWidth: 96,
            padding: 0,
            margin: 0,
            borderWidth: 0,
        },
        valueInputSmall: {
            fontSize: 28,
        },
        valueUnit: {
            ...typography.variant.body,
            fontFamily: typography.families.heading,
            fontWeight: "600",
            fontSize: 17,
            color: colors.textSecondary,
        },
        timeRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginTop: spacing.sm,
        },
        timeInput: {
            fontFamily: typography.families.heading,
            fontWeight: "600",
            fontSize: typography.sizes.body,
            color: colors.text,
            padding: 0,
            margin: 0,
            borderWidth: 0,
            minWidth: 64,
        },
    };
});
