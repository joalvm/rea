import { createStyles } from "@/theme/createStyles";

/**
 * Espejo RN de `.seg` / `.seg .opt` / `.seg .opt.on` del design-system
 * (docs/design-system/screens/checkin.html).
 *
 * - Container: row, bg c50 (primarySubtle), radius 14, padding 4, gap 4.
 * - Item base: flex 1, columna, center, gap 4, padding 10/4, radius 10,
 *   texto Quicksand 600 12.5 ink3 (textMuted). Sin fondo (transparente
 *   sobre el primarySubtle del container).
 * - Item on: fondo blanco (surface/background), texto ink (text), sombra-susurro.
 *
 * El control es compacto (icono 18 + label 12.5) pero como siempre lleva
 * icono, la altura natural (~48) cumple el área táctil mínima.
 */
export const useSegmentedControlStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows } = theme;

    return {
        container: {
            flexDirection: "row",
            gap: spacing.xs,
            padding: spacing.xs,
            borderRadius: radius.lg,
            backgroundColor: colors.primarySubtle,
        },
        item: {
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            gap: spacing.xs,
            backgroundColor: "transparent",
            borderRadius: radius.md,
            paddingVertical: 10,
            paddingHorizontal: spacing.xs,
        },
        itemOn: {
            backgroundColor: colors.background,
            ...shadows[1],
        },
        itemText: {
            fontFamily: typography.families.heading,
            fontWeight: "600",
            fontSize: 12.5,
            color: colors.textMuted,
            textAlign: "center",
        },
        itemTextOn: {
            color: colors.text,
        },
    };
});
