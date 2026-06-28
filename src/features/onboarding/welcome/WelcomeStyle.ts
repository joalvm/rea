import { createStyles } from "@/theme/createStyles";

export const useWelcomeStyles = createStyles((theme) => ({
    wordmark: {
        fontFamily: theme.typography.families.heading,
        fontSize: 44,
        lineHeight: 46,
        color: theme.colors.primaryPressed,
        letterSpacing: -1,
    },
    tagline: {
        ...theme.typography.variant.overline,
        color: theme.colors.textMuted,
        marginTop: 8,
    },
    spacer: {
        height: theme.spacing.xl,
    },
    deviceChip: {
        marginTop: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs + 2,
        borderRadius: 999,
        backgroundColor: theme.colors.warningSurface,
        borderWidth: 1,
        borderColor: theme.colors.warning,
        alignSelf: "center",
    },
    deviceChipText: {
        ...theme.typography.variant.caption,
        color: theme.colors.warningText,
    },
}));
