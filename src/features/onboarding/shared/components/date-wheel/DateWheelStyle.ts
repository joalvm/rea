import { createStyles } from "@/theme/createStyles";

export const useDateWheelStyles = createStyles((theme) => ({
    row: {
        flexDirection: "row",
        gap: theme.spacing.sm,
    },
    day: {
        flex: 1,
    },
    month: {
        flex: 1.3,
    },
    year: {
        flex: 1.1,
    },
}));
