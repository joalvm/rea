import { createStyles } from "@/theme/createStyles";

const MAX_CONTENT_WIDTH = 560;

export const useCalendarStyles = createStyles((theme) => ({
    screen: {
        backgroundColor: theme.colors.background,
        flex: 1,
    },
    container: {
        alignSelf: "center",
        gap: theme.spacing.lg,
        maxWidth: MAX_CONTENT_WIDTH,
        paddingBottom: theme.spacing["4xl"],
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing["3xl"],
        width: "100%",
    },
    header: {
        gap: theme.spacing.xs,
    },
    title: {
        ...theme.typography.variant.h1,
        color: theme.colors.text,
    },
    description: {
        ...theme.typography.variant.body,
        color: theme.colors.textSecondary,
    },
    monthHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    monthTitleWrap: {
        alignItems: "center",
        gap: theme.spacing.xs,
    },
    monthTitle: {
        ...theme.typography.variant.h3,
        color: theme.colors.text,
        textTransform: "capitalize",
    },
    todayAction: {
        minHeight: theme.sizing.minTouch,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
    },
    todayActionLabel: {
        ...theme.typography.variant.subhead,
        color: theme.colors.link,
    },
    calendarCard: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.xl,
        borderWidth: theme.borderWidth.thin,
        padding: theme.spacing.md,
        ...theme.shadows[1],
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.md,
    },
    legendItem: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.spacing.xs,
    },
    legendMark: {
        borderRadius: theme.radius.full,
        height: theme.spacing.md,
        width: theme.spacing.md,
    },
    legendMenstruation: {
        backgroundColor: theme.colors.dangerSurface,
        borderColor: theme.colors.danger,
        borderWidth: theme.borderWidth.thin,
    },
    legendFertile: {
        backgroundColor: theme.colors.warningSurface,
        borderColor: theme.colors.warning,
        borderWidth: theme.borderWidth.thin,
    },
    legendRecord: {
        backgroundColor: theme.colors.primary,
    },
    legendLabel: {
        ...theme.typography.variant.footnote,
        color: theme.colors.textSecondary,
    },
    pressed: {
        opacity: theme.state.pressedOpacity,
    },
}));
