import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fff",
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#C71585" },
    subtitle: { fontSize: 14, color: "#999", marginTop: 4 },
    description: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 16,
    },
    button: {
        marginTop: 32,
        backgroundColor: "#C71585",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
