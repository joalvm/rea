import { createStyles } from "@/theme/createStyles";

export const useScreenTitleStyles = createStyles((theme) => ({
    title: {
        ...theme.typography.variant.h1,
        fontSize: 26,
        lineHeight: 31,
        color: theme.colors.text,
    },
}));
