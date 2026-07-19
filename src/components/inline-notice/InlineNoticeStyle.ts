import { createStyles } from "@/theme/createStyles";

export const useInlineNoticeStyles = createStyles((theme) => ({
    notice: {
        alignItems: "flex-start",
        borderRadius: theme.radius.lg,
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
    },
    copy: {
        flex: 1,
        gap: theme.spacing.xs,
    },
    title: {
        ...theme.typography.variant.subhead,
    },
    body: {
        ...theme.typography.variant.footnote,
    },
}));
