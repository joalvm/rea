import { createStyles } from "@/theme/createStyles";

export const useCheckinIntroStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, sizing } = theme;

    return {
        heroWrap: {
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.xl,
        },
        heroBlob: {
            width: 80,
            height: 80,
            borderRadius: radius.xl,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            ...typography.variant.h1,
            fontFamily: typography.families.heading,
            color: colors.text,
            textAlign: "center",
        },
        lead: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "center",
            maxWidth: sizing.readableMaxWidth,
        },
        options: {
            gap: spacing.sm,
            marginTop: spacing.md,
        },
    };
});
