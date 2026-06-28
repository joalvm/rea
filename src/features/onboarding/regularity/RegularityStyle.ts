import { createStyles } from "@/theme/createStyles";

export const useRegularityStyles = createStyles(() => ({
    header: {
        gap: 4,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 10,
    },
    cardWrap: {
        width: "48%",
    },
}));
