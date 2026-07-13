import { createStyles } from "@/theme/createStyles";

export const useDiaryStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, sizing, borderWidth } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing["3xl"],
            gap: spacing.lg,
        },
        header: {
            gap: spacing.xs,
        },
        title: {
            ...typography.variant.h1,
            color: colors.text,
        },
        subtitle: {
            ...typography.variant.body,
            color: colors.textSecondary,
        },
        monthBar: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        monthNavButton: {
            width: sizing.minTouch,
            height: sizing.minTouch,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
        },
        monthLabel: {
            ...typography.variant.title,
            color: colors.text,
            textTransform: "capitalize",
        },
        todayChip: {
            backgroundColor: colors.primarySubtle,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
        },
        todayChipText: {
            ...typography.variant.caption,
            color: colors.primary,
            fontFamily: typography.families.heading,
        },
        listWrap: {
            gap: spacing.md,
        },
        empty: {
            paddingVertical: spacing["4xl"],
            alignItems: "center",
            gap: spacing.md,
        },
        emptyText: {
            ...typography.variant.body,
            color: colors.textMuted,
            textAlign: "center",
            maxWidth: sizing.readableMaxWidth,
        },
        sectionDivider: {
            height: borderWidth.hairline,
            backgroundColor: colors.divider,
            marginVertical: spacing.sm,
        },
    };
});
