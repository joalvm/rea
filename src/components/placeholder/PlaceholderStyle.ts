import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        padding: 24,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: "#F3F4F6",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: "#6B7280",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        color: "#111827",
    },
    path: {
        fontSize: 12,
        fontFamily: "monospace",
        color: "#9CA3AF",
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        color: "#4B5563",
        maxWidth: 320,
    },
    links: {
        alignSelf: "stretch",
        gap: 8,
        marginTop: 8,
    },
    linkRow: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
    },
    linkLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    linkHint: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    button: {
        marginTop: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 220,
        alignItems: "center",
    },
    primary: {
        backgroundColor: "#C71585",
    },
    primaryText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    secondary: {
        backgroundColor: "transparent",
    },
    secondaryText: {
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "500",
    },
});
