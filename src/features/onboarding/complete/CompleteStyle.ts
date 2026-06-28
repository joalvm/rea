import { createStyles } from "@/theme/createStyles";

export const useCompleteStyles = createStyles((theme) => ({
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
    disclaimerBox: {
        flexDirection: "row",
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surfaceAlt,
        marginTop: theme.spacing.sm,
    },
    disclaimerText: {
        flex: 1,
        ...theme.typography.variant.footnote,
        lineHeight: 18,
        color: theme.colors.textSecondary,
    },
}));
