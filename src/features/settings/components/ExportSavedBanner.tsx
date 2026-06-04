import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { accents, colors, radii, shadow, surfaces, type } from "@/theme";

interface ExportSavedBannerProps {
    message: string;
    onDismiss: () => void;
    onShare?: () => void;
}

/** Banner breve para confirmar guardado local y ofrecer compartir sin abrir otro modal. */
export default function ExportSavedBanner({ message, onDismiss, onShare }: ExportSavedBannerProps) {
    const { t } = useTranslation("settings");

    return (
        <View pointerEvents="box-none" style={styles.wrap}>
            <View style={styles.banner}>
                <View style={styles.copy}>
                    <View style={styles.titleRow}>
                        <MaterialCommunityIcons color={colors.success} name="check-circle" size={16} />
                        <Text style={styles.title}>{t("backup.export.savedBannerTitle")}</Text>
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
                            <Text style={styles.shareText}>{t("common:actions.share")}</Text>
                        </Pressable>
                    ) : null}

                    <Pressable
                        accessibilityLabel={t("common:actions.close")}
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
        backgroundColor: accents.primary.tint,
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
        backgroundColor: surfaces.cardSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        opacity: 0.78,
    },
});
