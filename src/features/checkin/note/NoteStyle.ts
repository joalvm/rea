import { createStyles } from "@/theme/createStyles";

export const useNoteStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        input: {
            minHeight: 160,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.body,
            lineHeight: typography.sizes.body * 1.4,
            color: colors.text,
            backgroundColor: colors.surface,
        },
    };
});
