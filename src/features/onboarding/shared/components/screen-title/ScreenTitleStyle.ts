import { createStyles } from "@/theme/createStyles";

export const useScreenTitleStyles = createStyles((theme) => ({
    title: {
        ...theme.typography.variant.h1,
        fontSize: 25,
        lineHeight: 30,
        color: theme.colors.text,
    },
    center: {
        textAlign: "center",
    },
}));
