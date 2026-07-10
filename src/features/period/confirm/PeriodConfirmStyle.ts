import { createStyles } from "@/theme/createStyles";

export const usePeriodConfirmStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing["2xl"],
            paddingVertical: spacing["4xl"],
        },
        iconWrap: {
            width: 84,
            height: 84,
            borderRadius: 999,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.sm,
        },
        title: {
            ...typography.variant.h1,
            color: colors.text,
            textAlign: "center",
        },
        description: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "center",
            maxWidth: sizing.readableMaxWidth,
        },
        note: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            alignSelf: "stretch",
            borderRadius: radius.lg,
            backgroundColor: colors.primarySubtle,
            padding: spacing.lg,
            marginTop: spacing.sm,
        },
        noteWarning: {
            backgroundColor: colors.warningSurface,
        },
        noteText: {
            ...typography.variant.footnote,
            color: colors.link,
            flex: 1,
            lineHeight: 18,
        },
        noteWarningText: {
            color: colors.warningText,
        },
        actions: {
            alignSelf: "stretch",
            gap: spacing.sm,
            marginTop: spacing.xl,
        },
        dismiss: {
            alignItems: "center",
            marginTop: spacing.xs,
        },
        dismissText: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.textMuted,
        },
    };
});
