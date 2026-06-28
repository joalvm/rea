import { createStyles } from "@/theme/createStyles";

export const useFieldLabelStyles = createStyles((theme) => ({
    label: {
        ...theme.typography.variant.footnote,
        lineHeight: 16,
        color: theme.colors.textSecondary,
    },
}));
