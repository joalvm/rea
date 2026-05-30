import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadow, type } from "@/theme";

interface ExportSavedBannerProps {
    message: string;
    onDismiss: () => void;
    onShare?: () => void;
}

/** Banner breve para confirmar guardado local y ofrecer compartir sin abrir otro modal. */
export default function ExportSavedBanner({ message, onDismiss, onShare }: ExportSavedBannerProps) {
    return (
        <View pointerEvents="box-none" style={styles.wrap}>
            <View style={styles.banner}>
                <View style={styles.copy}>
                    <View style={styles.titleRow}>
                        <MaterialCommunityIcons color={colors.success} name="check-circle" size={16} />
                        <Text style={styles.title}>Respaldo guardado</Text>
                    </View>
                    <Text style={styles.message}>{message}</Text>
                </View>

                <View style={styles.actions}>
                    {onShare ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={onShare}
                            style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.shareText}>Compartir</Text>
                        </Pressable>
                    ) : null}

                    <Pressable
                        accessibilityLabel="Cerrar aviso de respaldo"
                        accessibilityRole="button"
                        onPress={onDismiss}
                        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                    >
                        <MaterialCommunityIcons color={colors.muted} name="close" size={16} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 18,
    },
    banner: {
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        ...shadow,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
    },
    copy: {
        flex: 1,
        minWidth: 0,
        gap: 4,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    title: {
        color: colors.ink,
        fontSize: type.small,
        fontWeight: "900",
    },
    message: {
        color: colors.muted,
        fontSize: type.small,
        lineHeight: 18,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    shareButton: {
        minHeight: 34,
        borderRadius: 999,
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    shareText: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.surfaceSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        opacity: 0.78,
    },
});
