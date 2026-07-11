import { createStyles } from "@/theme/createStyles";

export const useReviewStyles = createStyles((theme) => {
    const { colors, spacing, typography, borderWidth } = theme;

    return {
        summary: {
            gap: spacing.sm,
        },
        editHint: {
            ...typography.variant.caption,
            color: colors.textMuted,
            marginBottom: spacing.xs,
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: spacing.md,
            paddingVertical: spacing.md,
            borderTopWidth: borderWidth.hairline,
            borderTopColor: colors.divider,
        },
        rowLabel: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.textMuted,
            flexShrink: 0,
        },
        rowValue: {
            ...typography.variant.body,
            color: colors.text,
            textAlign: "right",
            flex: 1,
        },
        empty: {
            ...typography.variant.body,
            color: colors.textMuted,
            textAlign: "center",
            paddingVertical: spacing.xl,
        },
    };
});
