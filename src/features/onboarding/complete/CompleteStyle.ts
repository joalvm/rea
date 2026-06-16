import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0FFF0",
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#228B22" },
    subtitle: { fontSize: 14, color: "#666", marginTop: 8 },
    button: {
        marginTop: 32,
        backgroundColor: "#228B22",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
