import { createStyles } from "@/theme/createStyles";

export const useMedicationsStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, borderWidth } = theme;

    return {
        addRow: {
            flexDirection: "row",
            gap: spacing.sm,
            alignItems: "center",
        },
        nameInput: {
            flex: 1,
            minHeight: 44,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.body,
            color: colors.text,
            backgroundColor: colors.surface,
        },
        doseInput: {
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            fontFamily: typography.families.sans,
            fontSize: typography.sizes.body,
            color: colors.text,
            backgroundColor: colors.surface,
            marginBottom: spacing.sm,
        },
        addBtn: {
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        addBtnDisabled: {
            backgroundColor: colors.border,
        },
        medList: {
            gap: spacing.md,
            marginTop: spacing.sm,
        },
        medCard: {
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.lg,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        medHead: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        medNameWrap: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            flex: 1,
        },
        medName: {
            ...typography.variant.subhead,
            fontFamily: typography.families.heading,
            color: colors.text,
            flex: 1,
        },
    };
});
