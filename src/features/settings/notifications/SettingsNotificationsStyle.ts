import { createStyles } from "@/theme/createStyles";

export const useSettingsNotificationsStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scroll: {
            flexGrow: 1,
            gap: spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing["2xl"],
        },
        title: {
            ...typography.variant.h1,
            color: colors.text,
        },
        lead: {
            ...typography.variant.body,
            color: colors.textSecondary,
            maxWidth: sizing.readableMaxWidth,
        },
        notice: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            ...shadows[1],
        },
        noticeBody: {
            flex: 1,
            gap: spacing.xs,
        },
        noticeTitle: {
            ...typography.variant.bodyStrong,
            color: colors.text,
        },
        noticeText: {
            ...typography.variant.footnote,
            color: colors.textSecondary,
        },
        noticeAction: {
            ...typography.variant.caption,
            color: colors.link,
            marginTop: spacing.xs,
        },
        detail: {
            gap: spacing.lg,
        },
        windowGroup: {
            gap: spacing.sm,
        },
        intervalGroup: {
            gap: spacing.sm,
        },
        fieldLabel: {
            ...typography.variant.bodyStrong,
            color: colors.text,
        },
        segmented: {
            flexDirection: "row",
            gap: spacing.xs,
        },
        segment: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            alignItems: "center",
        },
        segmentActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        segmentText: {
            ...typography.variant.subhead,
            color: colors.textSecondary,
        },
        segmentTextActive: {
            ...typography.variant.bodyStrong,
            color: colors.onPrimary,
        },
    };
});
