import { createStyles } from "@/theme/createStyles";

export const useOnboardingScreenStyles = createStyles((theme) => {
    const { colors, spacing, borderWidth, typography } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        progressWrap: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xs,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            minHeight: 44,
        },
        back: {
            width: 38,
            height: 38,
            borderRadius: 999,
            borderWidth: borderWidth.thick,
            borderColor: colors.borderStrong,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        backPressed: {
            opacity: 0.6,
        },
        step: {
            ...typography.variant.caption,
            color: colors.textMuted,
        },
        bodyContent: {
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            gap: spacing.lg,
            flexGrow: 1,
        },
        bodyCenter: {
            alignItems: "center",
            justifyContent: "center",
        },
        divider: {
            height: borderWidth.thin,
            backgroundColor: colors.divider,
            marginHorizontal: spacing.xl,
        },
        footer: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
            gap: spacing.sm,
            backgroundColor: colors.background,
        },
    };
});
