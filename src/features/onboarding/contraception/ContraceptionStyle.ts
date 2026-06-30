import { createStyles } from "@/theme/createStyles";

export const useContraceptionStyles = createStyles((theme) => ({
    header: {
        gap: 4,
    },
    // Aviso suave en tinte ámbar, sin borde (la dirección evita marcos duros).
    warningBox: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.warningSurface,
    },
    warningText: {
        flex: 1,
        ...theme.typography.variant.footnote,
        lineHeight: 18,
        color: theme.colors.warningText,
    },
}));
