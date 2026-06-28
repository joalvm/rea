import { createStyles } from "@/theme/createStyles";

export const useScreenLeadStyles = createStyles((theme) => ({
    lead: {
        ...theme.typography.variant.body,
        color: theme.colors.textSecondary,
        marginTop: -6,
    },
}));
