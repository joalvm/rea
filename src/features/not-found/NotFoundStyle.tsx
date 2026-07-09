import { createStyles } from "@/theme/createStyles";

export const useNotFoundStyles = createStyles((theme) => ({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing["2xl"],
        backgroundColor: theme.colors.background,
    },
    title: {
        ...theme.typography.variant.h3,
        color: theme.colors.text,
    },
    link: {
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
    },
    linkText: {
        ...theme.typography.variant.subhead,
        color: theme.colors.link,
    },
}));
