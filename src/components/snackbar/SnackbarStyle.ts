import { createStyles } from "@/theme/createStyles";

export const useSnackbarStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, sizing, borderWidth } = theme;

    return {
        wrap: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: spacing["5xl"],
            paddingHorizontal: spacing.lg,
            alignItems: "center",
        },
        bar: {
            backgroundColor: colors.text,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            maxWidth: sizing.readableMaxWidth,
            width: "100%",
            ...shadows[2],
            borderWidth: borderWidth.hairline,
            borderColor: colors.border,
        },
        message: {
            ...typography.variant.body,
            color: colors.background,
            flex: 1,
            flexWrap: "wrap",
        },
        action: {
            minWidth: 56,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            alignItems: "center",
            justifyContent: "center",
        },
        actionLabel: {
            ...typography.variant.bodyStrong,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 0.4,
        },
    };
});
