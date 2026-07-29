import { createStyles } from "@/theme/createStyles";

export const useHomeStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            paddingBottom: spacing["5xl"],
        },
        body: {
            paddingHorizontal: spacing["2xl"],
            gap: spacing.lg,
            marginTop: spacing.xl,
        },
        greeting: {
            ...typography.variant.h3,
            color: colors.text,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            padding: spacing.xl,
            gap: spacing.sm,
            ...shadows[1],
        },
        proposalCard: {
            backgroundColor: colors.warningSurface,
            borderRadius: radius.xl,
            borderWidth: borderWidth.thin,
            borderColor: colors.warning,
            padding: spacing.xl,
            gap: spacing.sm,
        },
        contentCard: {
            backgroundColor: colors.primarySubtle,
            borderRadius: radius.xl,
            borderWidth: borderWidth.thin,
            borderColor: colors.primary,
            padding: spacing.xl,
            gap: spacing.sm,
        },
        contentEyebrow: {
            ...typography.variant.caption,
            color: colors.link,
            textTransform: "uppercase",
            letterSpacing: 0.8,
        },
        cardTitle: {
            ...typography.variant.h3,
            color: colors.text,
        },
        cardText: {
            ...typography.variant.callout,
            color: colors.textSecondary,
        },
        chips: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        chip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            backgroundColor: colors.primaryTint,
        },
        chipText: {
            ...typography.variant.caption,
            color: colors.text,
        },
        secondaryBtn: {
            minHeight: sizing.controlMd,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        secondaryBtnText: {
            ...typography.variant.bodyStrong,
            color: colors.link,
        },
        disclaimer: {
            ...typography.variant.caption,
            color: colors.textMuted,
            lineHeight: 18,
        },
        pressed: {
            opacity: 0.85,
        },
    };
});
