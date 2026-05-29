import { StyleSheet } from "react-native";

import { colors, radii, type } from "../../theme";

const styles = StyleSheet.create({
    scrim: {
        flex: 1,
        backgroundColor: "rgba(27,44,51,0.28)",
        justifyContent: "flex-end",
    },
    keyboardLayer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheet: {
        maxHeight: "88%",
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        backgroundColor: colors.background,
        paddingTop: 10,
        paddingHorizontal: 18,
    },
    handle: {
        alignSelf: "center",
        width: 42,
        height: 5,
        borderRadius: 999,
        backgroundColor: "rgba(8, 124, 155, 0.22)",
        marginBottom: 14,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
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
        marginTop: 4,
    },
    close: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        gap: 22,
        paddingTop: 24,
        paddingBottom: 36,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 9,
    },
    chip: {
        minHeight: 40,
        borderRadius: radii.md,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.1)",
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    chipTextActive: {
        color: colors.primaryInk,
    },
    input: {
        minHeight: 96,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.1)",
        color: colors.ink,
        padding: 16,
        fontSize: type.body,
        textAlignVertical: "top",
    },
    compactInput: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.1)",
        color: colors.ink,
        paddingHorizontal: 16,
        fontSize: type.body,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
    },
    deleteButton: {
        flex: 1,
        borderColor: "rgba(219,79,102,0.24)",
        backgroundColor: colors.surface,
    },
    deleteButtonLabel: {
        color: colors.period,
    },
    saveButton: {
        width: "100%",
    },
    saveButtonSplit: {
        flex: 1,
        width: undefined,
    },
    helperText: {
        color: colors.muted,
        textAlign: "center",
        fontSize: type.small,
        lineHeight: 18,
        marginTop: -6,
    },
    privacy: {
        color: colors.muted,
        textAlign: "center",
        fontSize: type.small,
        lineHeight: 18,
    },
});

export default styles;
