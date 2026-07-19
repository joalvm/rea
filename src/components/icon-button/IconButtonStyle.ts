import { createStyles } from "@/theme/createStyles";

export const useIconButtonStyles = createStyles((theme) => ({
    button: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        borderWidth: theme.borderWidth.thin,
        height: theme.sizing.controlMd,
        justifyContent: "center",
        width: theme.sizing.controlMd,
    },
    ghost: {
        backgroundColor: "transparent",
        borderColor: "transparent",
    },
    pressed: {
        opacity: theme.state.pressedOpacity,
        transform: [{ scale: theme.state.pressedScale }],
    },
    disabled: {
        opacity: theme.state.disabledOpacity,
    },
}));
