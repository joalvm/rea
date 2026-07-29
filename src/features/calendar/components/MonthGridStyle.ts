import { createStyles } from "@/theme/createStyles";

const DAY_WIDTH = "14.285714%";

export const useMonthGridStyles = createStyles((theme) => ({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: theme.spacing.sm,
    },
    weekday: {
        ...theme.typography.variant.caption,
        color: theme.colors.textMuted,
        textAlign: "center",
        width: DAY_WIDTH,
    },
    cell: {
        alignItems: "center",
        borderColor: "transparent",
        borderRadius: theme.radius.full,
        borderWidth: theme.borderWidth.thin,
        height: theme.sizing.controlSm,
        justifyContent: "center",
        position: "relative",
        width: DAY_WIDTH,
    },
    day: {
        ...theme.typography.variant.subhead,
        color: theme.colors.text,
    },
    outsideDay: {
        ...theme.typography.variant.subhead,
        color: theme.colors.placeholder,
    },
    eventDot: {
        borderRadius: theme.radius.full,
        bottom: theme.spacing.xs,
        height: theme.spacing.xs,
        position: "absolute",
        width: theme.spacing.xs,
    },
    today: {
        borderColor: theme.colors.primaryPressed,
    },
    estimated: {
        borderColor: theme.colors.primary,
        borderStyle: "dashed",
    },
    pressed: {
        opacity: theme.state.pressedOpacity,
        transform: [{ scale: theme.state.pressedScale }],
    },
}));
