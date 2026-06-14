import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#FFFAF0",
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#D2691E" },
    subtitle: { fontSize: 14, color: "#999", marginTop: 4 },
    date: { fontSize: 18, fontWeight: "600", color: "#333", marginTop: 16 },
    description: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 12,
    },
    button: {
        marginTop: 32,
        backgroundColor: "#D2691E",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
