import { createStyles } from "@/theme/createStyles";

/**
 * ChoiceCard compacta para fila horizontal única (espejo denso del
 * design-system). Pensada para que N tarjetas quepan en una sola línea:
 * icono en burbuja 32 con icono 18, label 12 sin descripción.
 *
 * - Card base: borde 1.5px línea, radio 12, fondo blanco, padding 8/4,
 *   columna, alignItems center, justify center, min-height 72, gap 4.
 * - Card on: borde 2px celeste, fondo primarySubtle.
 * - Icon bubble: 32×32, radio 10, fondo primaryTint, icono 18 link.
 *   On: fondo primary, icono onPrimary.
 * - Label: Quicksand bold 12, text, center.
 */
export const useChoiceCardStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        card: {
            flexGrow: 1,
            alignSelf: "stretch",
            minHeight: 64,
            gap: spacing.xs,
            borderWidth: borderWidth.thin + borderWidth.thin * 0.5,
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.background,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.xs,
            alignItems: "center",
            justifyContent: "center",
        },
        cardOn: {
            borderWidth: borderWidth.thick,
            borderColor: colors.primary,
            backgroundColor: colors.primarySubtle,
        },
        iconBubble: {
            width: 32,
            height: 32,
            borderRadius: radius.sm,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
        },
        iconBubbleOn: {
            backgroundColor: colors.primarySubtle,
        },
        label: {
            fontFamily: typography.families.heading,
            fontWeight: "700",
            fontSize: 12,
            lineHeight: 14,
            color: colors.text,
            textAlign: "center",
        },
        description: {
            fontSize: 10,
            lineHeight: 10,
            color: colors.textMuted,
            textAlign: "center",
        },
    };
});
