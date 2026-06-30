import { createStyles } from "@/theme/createStyles";

export const useStepDotsStyles = createStyles((theme) => ({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.xs + 2,
        marginBottom: theme.spacing.sm,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryTint,
    },
    dotActive: {
        width: 22,
    },
}));
