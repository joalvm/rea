import { createStyles } from "@/theme/createStyles";

export const usePredictionsStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

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
