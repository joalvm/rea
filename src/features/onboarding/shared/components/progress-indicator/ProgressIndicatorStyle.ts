import { createStyles } from "@/theme/createStyles";

export const useProgressIndicatorStyles = createStyles((theme) => ({
    track: {
        height: 6,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: theme.colors.surfaceSunken,
    },
    fill: {
        height: "100%",
        borderRadius: 999,
    },
}));
