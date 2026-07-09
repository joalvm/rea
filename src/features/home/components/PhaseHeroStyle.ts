import { createStyles } from "@/theme/createStyles";

export const useHeroStyles = createStyles((theme) => {
    const { spacing, radius, typography, sizing, shadows } = theme;

    return {
        hero: {
            overflow: "hidden",
            borderBottomLeftRadius: radius["3xl"],
            borderBottomRightRadius: radius["3xl"],
            paddingHorizontal: spacing["2xl"],
            paddingBottom: spacing["3xl"],
        },
        blob: {
            position: "absolute",
            borderRadius: radius.full,
        },
        blobTop: {
            width: 230,
            height: 230,
            top: -70,
            right: -50,
        },
        blobBottom: {
            width: 170,
            height: 170,
            bottom: -60,
            left: -40,
        },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginBottom: spacing.lg,
        },
        iconBubble: {
            width: 44,
            height: 44,
            borderRadius: radius.full,
            alignItems: "center",
            justifyContent: "center",
        },
        overline: {
            ...typography.variant.overline,
        },
        label: {
            ...typography.variant.display,
            marginBottom: spacing.xs,
        },
        caption: {
            ...typography.variant.body,
        },
        chipsRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginTop: spacing.lg,
        },
        chip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
        },
        chipText: {
            ...typography.variant.subhead,
        },
        cta: {
            alignSelf: "flex-start",
            marginTop: spacing.xl,
            minHeight: sizing.controlMd,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            ...shadows[2],
        },
        ctaText: {
            ...typography.variant.bodyStrong,
        },
        pressed: {
            opacity: 0.85,
        },
    };
});
