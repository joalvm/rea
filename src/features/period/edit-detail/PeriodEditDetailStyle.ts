import { createStyles } from "@/theme/createStyles";

export const usePeriodEditDetailStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography } = theme;

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
        label: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.textSecondary,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
        },
        openHint: {
            ...typography.variant.footnote,
            color: colors.textMuted,
            marginTop: spacing.xs,
        },
        divider: {
            height: 1,
            backgroundColor: colors.divider,
            marginVertical: spacing.md,
        },
        warning: {
            borderRadius: radius.lg,
            backgroundColor: colors.dangerSurface,
            padding: spacing.lg,
            marginTop: spacing.md,
        },
        warningText: {
            ...typography.variant.footnote,
            color: colors.dangerText,
            lineHeight: 18,
        },
        actions: {
            marginTop: spacing.xl,
        },
        deleteLink: {
            alignItems: "center",
            marginTop: spacing.md,
            paddingVertical: spacing.sm,
        },
        deleteLinkText: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.dangerText,
        },
    };
});
