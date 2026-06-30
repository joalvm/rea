import { createStyles } from "@/theme/createStyles";

export const useReaIllustrationStyles = createStyles((theme) => ({
    wrap: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    blob: {
        backgroundColor: theme.colors.primaryTint,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    orb: {
        position: "absolute",
        backgroundColor: "rgba(255,255,255,0.9)",
    },
    spark: {
        position: "absolute",
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
    },
    spark1: {
        width: 9,
        height: 9,
        top: "20%",
        right: "22%",
    },
    spark2: {
        width: 7,
        height: 7,
        bottom: "26%",
        left: "20%",
    },
    spark3: {
        width: 8,
        height: 8,
        top: "42%",
        right: "16%",
    },
}));
