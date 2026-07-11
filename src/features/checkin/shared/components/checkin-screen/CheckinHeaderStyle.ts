import { createStyles } from "@/theme/createStyles";

export const useCheckinHeaderStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography } = theme;

    return {
        wrap: {
            alignItems: "center",
            gap: spacing.sm,
            paddingVertical: spacing.md,
        },
        blob: {
            width: 64,
            height: 64,
            borderRadius: radius.xl,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            ...typography.variant.h2,
            fontFamily: typography.families.heading,
            color: colors.text,
            textAlign: "center",
        },
        lead: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "center",
        },
    };
});
