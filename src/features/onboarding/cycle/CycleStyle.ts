import { createStyles } from "@/theme/createStyles";

export const useCycleStyles = createStyles((theme) => ({
    header: {
        gap: 4,
    },
    rows: {
        marginTop: theme.spacing.xs,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    rowLabel: {
        flex: 1,
        fontFamily: theme.typography.families.heading,
        fontSize: theme.typography.sizes.callout + 1,
        color: theme.colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.divider,
    },
    note: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primarySubtle,
    },
    noteText: {
        flex: 1,
        ...theme.typography.variant.footnote,
        lineHeight: 18,
        color: theme.colors.link,
    },
}));
