import { createStyles } from "@/theme/createStyles";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;

export const useWheelPickerStyles = createStyles((theme) => {
    const { colors, radius, typography, borderWidth, spacing } = theme;

    return {
        wheel: {
            position: "relative",
            height: ITEM_HEIGHT * VISIBLE_COUNT,
            borderWidth: borderWidth.thick,
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            overflow: "hidden",
        },
        scrollContent: {
            paddingVertical: ITEM_HEIGHT * 2,
        },
        band: {
            position: "absolute",
            top: "50%",
            left: spacing.sm,
            right: spacing.sm,
            height: ITEM_HEIGHT,
            marginTop: -ITEM_HEIGHT / 2,
            borderTopWidth: borderWidth.thick,
            borderBottomWidth: borderWidth.thick,
            borderTopColor: colors.primaryPressed,
            borderBottomColor: colors.primaryPressed,
            backgroundColor: colors.primarySubtle,
            borderRadius: radius.md,
        },
        itemFar: {
            height: ITEM_HEIGHT,
            lineHeight: ITEM_HEIGHT,
            fontSize: typography.sizes.caption + 2,
            fontFamily: typography.families.sans,
            color: colors.placeholder,
            textAlign: "center",
        },
        itemNear: {
            height: ITEM_HEIGHT,
            lineHeight: ITEM_HEIGHT,
            fontSize: typography.sizes.body,
            fontFamily: typography.families.sans,
            color: colors.textSecondary,
            textAlign: "center",
        },
        itemCenter: {
            height: ITEM_HEIGHT,
            lineHeight: ITEM_HEIGHT,
            fontSize: typography.sizes.h3 + 2,
            fontFamily: typography.families.heading,
            color: colors.link,
            textAlign: "center",
        },
    };
});

export const WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;
