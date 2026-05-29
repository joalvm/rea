import { StyleSheet } from "react-native";

import { colors, radii, type } from "@/theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 52,
    },
    header: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primarySoft,
    },
    headerText: {
        flex: 1,
        minWidth: 0,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    title: {
        color: colors.ink,
        fontSize: type.title,
        fontWeight: "900",
        lineHeight: 28,
        flexShrink: 1,
    },
    content: {
        gap: 16,
        padding: 18,
        paddingBottom: 36,
    },
    helper: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
        paddingHorizontal: 2,
    },
    momentCard: {
        gap: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    momentTitleRow: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    momentIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
    },
    momentCopy: {
        flex: 1,
        minWidth: 0,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    question: {
        color: colors.muted,
        fontSize: type.small,
        marginTop: 4,
        lineHeight: 17,
    },
    timeInput: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        color: colors.ink,
        paddingHorizontal: 16,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    days: {
        flexDirection: "row",
        gap: 8,
    },
    day: {
        flex: 1,
        minHeight: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceSoft,
    },
    dayActive: {
        backgroundColor: colors.primary,
    },
    dayText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    dayTextActive: {
        color: colors.primaryInk,
    },
    remove: {
        alignSelf: "flex-start",
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
    },
    removeText: {
        color: colors.danger,
        fontSize: type.small,
        fontWeight: "800",
    },
    addCard: {
        gap: 12,
    },
    input: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        color: colors.ink,
        paddingHorizontal: 16,
        fontSize: type.body,
    },
});

export default styles;
