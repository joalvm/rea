import { createStyles } from "@/theme/createStyles";

export const useDiaryEntryStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, sizing, shadows, borderWidth } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scroll: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing["5xl"],
            gap: spacing.xl,
        },
        header: {
            gap: spacing.xs,
        },
        dateTitle: {
            ...typography.variant.h2,
            color: colors.text,
            textTransform: "capitalize",
        },
        section: {
            gap: spacing.md,
        },
        sectionTitle: {
            ...typography.variant.h3,
            color: colors.text,
        },
        timeline: {
            gap: spacing.md,
        },
        summaryCard: {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            gap: spacing.sm,
            ...shadows[1],
        },
        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        summaryLabel: {
            ...typography.variant.body,
            color: colors.textSecondary,
        },
        summaryValue: {
            ...typography.variant.bodyStrong,
            color: colors.text,
            fontVariant: ["tabular-nums"] as const,
        },
        empty: {
            paddingVertical: spacing["4xl"],
            alignItems: "center",
            gap: spacing.lg,
        },
        emptyText: {
            ...typography.variant.body,
            color: colors.textMuted,
            textAlign: "center",
            maxWidth: sizing.readableMaxWidth,
        },
        loading: {
            paddingVertical: spacing["3xl"],
            alignItems: "center",
        },
        loadingText: {
            ...typography.variant.body,
            color: colors.textMuted,
        },
        footer: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: borderWidth.hairline,
            borderTopColor: colors.divider,
        },
    };
});
