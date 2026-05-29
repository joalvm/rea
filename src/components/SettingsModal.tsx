import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radii, type } from "../theme";
import { NotificationMoment } from "../types/notifications.types";
import { IconButton } from "./IconButton";
import { SoftCard } from "./SoftCard";

interface SettingsModalProps {
    visible: boolean;
    moments: NotificationMoment[];
    onClose: () => void;
    onOpenSchedule: () => void;
    onReset: () => Promise<void>;
}

export function SettingsModal({ visible, moments, onClose, onOpenSchedule, onReset }: SettingsModalProps) {
    const activeMoments = moments.filter((moment) => moment.enabled).length;

    const confirmReset = () => {
        Alert.alert("Empezar de cero", "Se borran tus registros de este teléfono y vuelves al inicio.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Borrar todo",
                style: "destructive",
                onPress: () => {
                    void onReset();
                },
            },
        ]);
    };

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <IconButton
                        backgroundColor={colors.primarySoft}
                        icon="chevron-left"
                        label="Cerrar ajustes"
                        onPress={onClose}
                    />
                    <View style={styles.headerCopy}>
                        <Text style={styles.kicker}>Ajustes</Text>
                        <Text style={styles.title}>Tu espacio, a tu ritmo</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <SettingRow
                        icon="bell-outline"
                        meta={`${activeMoments} activos`}
                        onPress={onOpenSchedule}
                        text="Elige cuándo quieres recibir una pregunta corta."
                        title="Momentos del día"
                    />

                    <SoftCard style={styles.privacyCard}>
                        <View style={styles.privacyIcon}>
                            <MaterialCommunityIcons color={colors.primaryDeep} name="shield-check-outline" size={25} />
                        </View>
                        <View style={styles.privacyCopy}>
                            <Text style={styles.cardTitle}>Tus datos se quedan aquí</Text>
                            <Text style={styles.cardText}>
                                Tus registros viven solo en este teléfono. Las notificaciones son discretas y no
                                muestran regla, fertilidad ni síntomas.
                            </Text>
                        </View>
                    </SoftCard>

                    <SoftCard style={styles.resetCard}>
                        <View style={styles.resetHeader}>
                            <View style={styles.resetIcon}>
                                <MaterialCommunityIcons color={colors.danger} name="refresh" size={24} />
                            </View>
                            <View style={styles.resetCopy}>
                                <Text style={styles.cardTitle}>Empezar de cero</Text>
                                <Text style={styles.cardText}>Borra todo y vuelve al primer paso.</Text>
                            </View>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            onPress={confirmReset}
                            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.resetButtonText}>Borrar mis datos</Text>
                        </Pressable>
                    </SoftCard>
                </ScrollView>
            </View>
        </Modal>
    );
}

interface SettingRowProps {
    title: string;
    text: string;
    meta: string;
    icon: string;
    onPress: () => void;
}

function SettingRow({ title, text, meta, icon, onPress }: SettingRowProps) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            <View style={styles.rowIcon}>
                <MaterialCommunityIcons color={colors.primaryDeep} name={icon as never} size={24} />
            </View>
            <View style={styles.rowBody}>
                <View style={styles.rowTitleLine}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.rowMeta}>{meta}</Text>
                </View>
                <Text style={styles.cardText}>{text}</Text>
            </View>
            <MaterialCommunityIcons color={colors.muted} name="chevron-right" size={24} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 54,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    headerCopy: {
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
        flexShrink: 1,
        fontSize: type.title,
        fontWeight: "900",
        lineHeight: 28,
        marginTop: 2,
    },
    content: {
        gap: 14,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 34,
    },
    row: {
        minHeight: 92,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.08)",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    pressed: {
        transform: [{ scale: 0.985 }],
    },
    rowIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    rowBody: {
        flex: 1,
        minWidth: 0,
        gap: 5,
    },
    rowTitleLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rowMeta: {
        color: colors.primaryDeep,
        fontSize: type.tiny,
        fontWeight: "900",
        backgroundColor: colors.primarySoft,
        borderRadius: 999,
        overflow: "hidden",
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    cardText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    privacyCard: {
        flexDirection: "row",
        gap: 13,
        alignItems: "flex-start",
    },
    privacyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    privacyCopy: {
        flex: 1,
        gap: 6,
    },
    resetCard: {
        gap: 14,
    },
    resetHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
    },
    resetIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.periodSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    resetCopy: {
        flex: 1,
        gap: 4,
    },
    resetButton: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.periodSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    resetButtonText: {
        color: colors.danger,
        fontSize: type.body,
        fontWeight: "900",
    },
});
