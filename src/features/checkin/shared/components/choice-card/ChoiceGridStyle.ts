import { createStyles } from "@/theme/createStyles";

export const useChoiceGridStyles = createStyles((theme) => ({
    grid: {
        flexDirection: "row",
        gap: theme.spacing.xs + 1,
    },
    item: {
        flex: 1,
    },
}));
