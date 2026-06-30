import { createStyles } from "@/theme/createStyles";

export const useCompleteStyles = createStyles((theme) => ({
    brand: {
        alignItems: "center",
        gap: 6,
    },
    wordmark: {
        fontFamily: theme.typography.families.heading,
        fontSize: 46,
        lineHeight: 48,
        color: theme.colors.primary,
        letterSpacing: -1.5,
    },
    tagline: {
        ...theme.typography.variant.overline,
        letterSpacing: 2.5,
        color: theme.colors.textMuted,
    },
    // Aviso suave (no método/diagnóstico) en tinte de marca, sin borde.
    disclaimerBox: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primarySubtle,
    },
    disclaimerText: {
        flex: 1,
        ...theme.typography.variant.footnote,
        lineHeight: 18,
        color: theme.colors.link,
    },
}));
