import { createStyles } from "@/theme/createStyles";

export const useScreenLeadStyles = createStyles((theme) => ({
    lead: {
        ...theme.typography.variant.body,
        color: theme.colors.textSecondary,
        marginTop: -6,
    },
    center: {
        textAlign: "center",
        marginTop: 0,
        maxWidth: 300,
    },
}));
