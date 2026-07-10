import { createStyles } from "@/theme/createStyles";

export const usePeriodEditStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flexGrow: 1,
            gap: spacing.md,
            paddingHorizontal: spacing["2xl"],
            paddingVertical: spacing.xl,
        },
        title: {
            ...typography.variant.h1,
            color: colors.text,
        },
        description: {
            ...typography.variant.body,
            color: colors.textSecondary,
        },
        emptyText: {
            ...typography.variant.body,
            color: colors.textMuted,
            marginTop: spacing.xl,
            textAlign: "center",
        },
        list: {
            gap: spacing.sm,
            marginTop: spacing.sm,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            ...shadows[1],
        },
        rowDate: {
            ...typography.variant.title,
            color: colors.text,
        },
        rowSource: {
            ...typography.variant.footnote,
            color: colors.textMuted,
            marginTop: 2,
        },
        rowSourceExcluded: {
            color: colors.dangerText,
        },
        badge: {
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: radius.pill,
        },
        badgeText: {
            ...typography.variant.caption,
        },
        badgeOpen: {
            backgroundColor: colors.primaryTint,
        },
        badgeOpenText: {
            color: colors.link,
        },
        badgeClosed: {
            backgroundColor: colors.surfaceSunken,
        },
        badgeClosedText: {
            color: colors.textMuted,
        },
        badgeExcluded: {
            backgroundColor: colors.dangerSurface,
        },
        badgeExcludedText: {
            color: colors.dangerText,
        },
    };
});
