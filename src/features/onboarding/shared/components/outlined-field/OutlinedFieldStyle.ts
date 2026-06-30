import { createStyles } from "@/theme/createStyles";

export const useOutlinedFieldStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        // Campo de texto estilo Material: borde sólido, SIN halo/ring.
        // Reposo = borde fino neutro; foco = borde de marca un punto más grueso.
        field: {
            borderWidth: borderWidth.thin + 1, // ~2px estable cross-device
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.lg,
            minHeight: theme.sizing.controlLg,
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.body,
            color: colors.text,
        },
        focused: {
            borderColor: colors.primaryPressed,
        },
    };
});
