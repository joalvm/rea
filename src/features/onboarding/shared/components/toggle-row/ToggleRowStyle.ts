import { createStyles } from "@/theme/createStyles";

export const useToggleRowStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        row: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            paddingVertical: spacing.sm,
        },
        text: {
            flex: 1,
            gap: 2,
        },
        titleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
        },
        title: {
            fontFamily: typography.families.heading,
            fontSize: typography.sizes.callout + 1,
            color: colors.text,
        },
        subtitle: {
            ...typography.variant.caption,
            color: colors.textMuted,
        },
        track: {
            width: 52,
            height: 32,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.divider,
            backgroundColor: colors.surfaceSunken,
            padding: 3,
            alignItems: "flex-start",
            justifyContent: "center",
        },
        knob: {
            width: 26,
            height: 26,
            borderRadius: 999,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
        },
    };
});
