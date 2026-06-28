import { createStyles } from "@/theme/createStyles";

export const useOutlinedFieldStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        field: {
            borderWidth: borderWidth.thick,
            borderColor: colors.borderStrong,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md - 2,
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.body,
            color: colors.text,
        },
        focused: {
            borderColor: colors.primaryPressed,
        },
    };
});
