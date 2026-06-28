import { createStyles } from "@/theme/createStyles";

export const useIntentStyles = createStyles(() => ({
    header: {
        gap: 10,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: 6,
        columnGap: 10,
        marginTop: 20,
    },
    cardWrap: {
        width: "45%",
        height: 160,
    },
}));
