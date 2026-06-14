import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#F0FFF0",
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#228B22" },
    subtitle: { fontSize: 14, color: "#999", marginTop: 4 },
    description: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 12,
    },
});
