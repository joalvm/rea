import { createStyles } from "@/theme/createStyles";

export const useContraceptionStyles = createStyles((theme) => ({
    header: {
        gap: 4,
    },
    warningBox: {
        flexDirection: "row",
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.warning,
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
