import { createStyles } from "@/theme/createStyles";

export const useHelpTextStyles = createStyles((theme) => ({
    help: {
        ...theme.typography.variant.footnote,
        lineHeight: 18,
        color: theme.colors.textMuted,
    },
}));
