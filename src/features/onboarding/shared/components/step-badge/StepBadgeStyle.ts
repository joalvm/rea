import { createStyles } from "@/theme/createStyles";

export const useStepBadgeStyles = createStyles((theme) => ({
    // Halo tenue detrás del blob → da profundidad y lo hace más "ilustrado".
    halo: {
        width: 96,
        height: 96,
        borderRadius: 999,
        backgroundColor: theme.colors.primarySubtle,
        alignItems: "center",
        justifyContent: "center",
    },
    blob: {
        width: 70,
        height: 70,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryTint,
        alignItems: "center",
        justifyContent: "center",
    },
}));
