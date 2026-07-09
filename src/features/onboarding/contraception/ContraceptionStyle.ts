import { createStyles } from "@/theme/createStyles";

export const useContraceptionStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        header: {
            gap: 4,
        },
        // "Prefiero no decirlo" es de primera clase: se ve sin desplazar, distinta
        // del grid (borde punteado = "salida", no un método más).
        preferNotToSay: {
            alignSelf: "center",
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.divider,
            borderStyle: "dashed",
        },
        preferNotToSayOn: {
            borderColor: colors.primary,
            borderStyle: "solid",
            backgroundColor: colors.primarySubtle,
        },
        preferNotToSayText: {
            ...typography.variant.footnote,
            color: colors.textMuted,
        },
        preferNotToSayTextOn: {
            fontFamily: typography.families.heading,
            color: colors.link,
        },
        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        chip: {
            flexBasis: "47%",
            flexGrow: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.lg,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: "center",
        },
        chipOn: {
            borderWidth: borderWidth.thick,
            borderColor: colors.primary,
            backgroundColor: colors.primarySubtle,
        },
        chipText: {
            ...typography.variant.subhead,
            color: colors.text,
            textAlign: "center",
        },
        chipTextOn: {
            fontFamily: typography.families.heading,
            color: colors.link,
        },
        // Aviso suave en tinte ámbar, sin borde (la dirección evita marcos duros).
        warningBox: {
            flexDirection: "row",
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colors.warningSurface,
        },
        warningText: {
            flex: 1,
            ...typography.variant.footnote,
            lineHeight: 18,
            color: colors.warningText,
        },
    };
});
