import { createStyles } from "@/theme/createStyles";

export const useScreenHeaderStyles = createStyles((theme) => ({
    wrap: {
        alignItems: "center",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
}));
