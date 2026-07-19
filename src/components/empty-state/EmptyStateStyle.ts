import { createStyles } from "@/theme/createStyles";

export const useEmptyStateStyles = createStyles((theme) => ({
    container: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.xl,
        borderWidth: theme.borderWidth.thin,
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing["3xl"],
        ...theme.shadows[1],
    },
    iconBubble: {
        alignItems: "center",
        backgroundColor: theme.colors.primaryTint,
        borderRadius: theme.radius.lg,
        height: theme.sizing.controlLg,
        justifyContent: "center",
        width: theme.sizing.controlLg,
    },
    title: {
        ...theme.typography.variant.h3,
        color: theme.colors.text,
        textAlign: "center",
    },
    description: {
        ...theme.typography.variant.body,
        color: theme.colors.textSecondary,
        textAlign: "center",
    },
}));
