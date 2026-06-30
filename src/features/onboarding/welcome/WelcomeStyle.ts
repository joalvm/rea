import { createStyles } from "@/theme/createStyles";

export const useWelcomeStyles = createStyles((theme) => ({
    brand: {
        alignItems: "center",
        gap: theme.spacing.sm,
    },
    tagline: {
        ...theme.typography.variant.overline,
        letterSpacing: 2.5,
        color: theme.colors.textMuted,
    },
    deviceChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "center",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs + 2,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primaryTint,
    },
    deviceChipText: {
        ...theme.typography.variant.caption,
        color: theme.colors.link,
    },
}));
