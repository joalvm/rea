import { createStyles } from "@/theme/createStyles";

export const useStatisticsStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            gap: spacing.md,
            paddingHorizontal: spacing["2xl"],
            paddingVertical: spacing["2xl"],
        },
        header: {
            gap: spacing.xs,
        },
        title: {
            ...typography.variant.h1,
            color: colors.text,
            textAlign: "left",
        },
        description: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "left",
            maxWidth: sizing.readableMaxWidth,
        },
        cardTitle: {
            ...typography.variant.h3,
            color: colors.text,
        },
        cardText: {
            ...typography.variant.body,
            color: colors.textSecondary,
        },
        insightCard: {
            alignSelf: "stretch",
            gap: spacing.sm,
            padding: spacing.xl,
            borderRadius: radius.xl,
            backgroundColor: colors.primaryTint,
        },
        metricCard: {
            alignSelf: "stretch",
            gap: spacing.xs,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            ...shadows[1],
        },
        metricTitle: {
            ...typography.variant.caption,
            color: colors.textMuted,
        },
        metricValue: {
            ...typography.variant.h2,
            color: colors.text,
        },
        metricFooter: {
            ...typography.variant.footnote,
            color: colors.textSecondary,
        },
        seriesCard: {
            alignSelf: "stretch",
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
        },
        series: {
            flexDirection: "row",
            alignItems: "flex-end",
            gap: spacing.xs,
            minHeight: 110,
        },
        seriesColumn: {
            flex: 1,
            alignItems: "center",
            gap: spacing.xs,
        },
        seriesBars: {
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 1,
            height: 92,
        },
        bar: {
            borderRadius: radius.sm,
            width: 4,
        },
        moodBar: { backgroundColor: colors.primary },
        energyBar: { backgroundColor: colors.success },
        painBar: { backgroundColor: colors.danger },
        seriesLabel: {
            ...typography.variant.caption,
            color: colors.textMuted,
        },
        links: {
            alignSelf: "stretch",
            gap: spacing.sm,
            marginTop: spacing.sm,
        },
        linkRow: {
            gap: spacing.xs,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            ...shadows[1],
        },
        linkLabel: {
            ...typography.variant.title,
            color: colors.text,
        },
        linkHint: {
            ...typography.variant.footnote,
            color: colors.textMuted,
        },
        button: {
            marginTop: spacing.sm,
            minHeight: sizing.controlMd,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.pill,
            minWidth: 240,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: spacing.sm,
        },
        pressed: {
            opacity: 0.85,
        },
        primary: {
            backgroundColor: colors.primary,
            ...shadows[2],
        },
        primaryText: {
            ...typography.variant.bodyStrong,
            color: colors.onPrimary,
        },
        secondary: {
            backgroundColor: "transparent",
        },
        secondaryText: {
            ...typography.variant.subhead,
            color: colors.link,
        },
    };
});
