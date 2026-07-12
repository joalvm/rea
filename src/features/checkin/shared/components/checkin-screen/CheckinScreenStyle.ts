import { createStyles } from "@/theme/createStyles";

export const useCheckinScreenStyles = createStyles((theme) => {
    const { colors, spacing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        bodyContent: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xl,
            gap: spacing.lg,
            flexGrow: 1,
        },
        /**
         * Pie del paso: cada screen lo aplica a su propio `<View>` con el CTA.
         * `marginTop: auto` empuja el botón al final del área visible cuando el
         * contenido no desborda; si hay scroll, queda al final del contenido.
         */
        footer: {
            marginTop: "auto",
            paddingTop: spacing.lg,
            gap: spacing.sm,
        },
    };
});
