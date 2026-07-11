import { createStyles } from "@/theme/createStyles";

export const useSymptomsStyles = createStyles((theme) => {
    const { colors, spacing, typography } = theme;

    return {
        group: {
            gap: spacing.sm,
        },
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
            borderRadius: spacing.md,
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
    };
});
