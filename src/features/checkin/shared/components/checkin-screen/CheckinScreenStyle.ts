import { createStyles } from "@/theme/createStyles";

export const useCheckinScreenStyles = createStyles((theme) => {
    const { colors, spacing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        // Respiro superior (sin botón de atrás): el chrome lo aporta la safe-area.
        topSpacer: {
            height: spacing.lg,
        },
        bodyContent: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xl,
            gap: spacing.lg,
            flexGrow: 1,
        },
        bodyCenter: {
            alignItems: "center",
            justifyContent: "center",
        },
        // Footer sin divisor: el lienzo respira hasta el CTA.
        footer: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            gap: spacing.sm,
            backgroundColor: colors.background,
        },
    };
});
