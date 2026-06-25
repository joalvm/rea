import { createStyles } from "@/theme/createStyles";

/**
 * Estilos del Placeholder (que se usa para pantallas en desarrollo o rutas no implementadas).
 * Es un componente de diseño relativamente complejo, con varios elementos (badge de fase, título, descripción, enlaces, botones)
 * que deben responder al tema (colores, tipografía, espaciado, sombras) para que las pantallas pendientes
 * se vean cuidadas y coherentes con el resto de la app mientras se aterriza su UI real.
 */
export const usePlaceholderStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing["2xl"],
            paddingVertical: spacing["4xl"],
        },
        badge: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            borderWidth: borderWidth.hairline,
            borderColor: colors.focusRing,
            backgroundColor: colors.primaryTint,
        },
        badgeText: {
            ...typography.variant.overline,
            color: colors.link,
        },
        title: {
            ...typography.variant.h1,
            color: colors.text,
            textAlign: "center",
        },
        path: {
            ...typography.variant.caption,
            fontFamily: typography.families.mono,
            color: colors.textMuted,
            backgroundColor: colors.surfaceSunken,
            borderWidth: borderWidth.hairline,
            borderColor: colors.border,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.sm,
            overflow: "hidden",
        },
        description: {
            ...typography.variant.body,
            color: colors.textSecondary,
            textAlign: "center",
            maxWidth: sizing.readableMaxWidth,
        },
        links: {
            alignSelf: "stretch",
            gap: spacing.sm,
            marginTop: spacing.sm,
        },
        linkRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            ...shadows[1],
        },
        linkText: {
            flex: 1,
            gap: 2,
        },
        linkLabel: {
            ...typography.variant.title,
            color: colors.text,
        },
        linkHint: {
            ...typography.variant.footnote,
            color: colors.textMuted,
        },
        button: {
            marginTop: spacing.sm,
            minHeight: sizing.controlMd,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.pill,
            minWidth: 240,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: spacing.sm,
        },
        pressed: {
            opacity: 0.85,
        },
        primary: {
            backgroundColor: colors.primary,
            ...shadows[2],
        },
        primaryText: {
            ...typography.variant.bodyStrong,
            color: colors.onPrimary,
        },
        secondary: {
            backgroundColor: "transparent",
        },
        secondaryText: {
            ...typography.variant.subhead,
            color: colors.link,
        },
    };
});
