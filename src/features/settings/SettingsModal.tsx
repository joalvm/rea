import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "../../theme";
import { IconButton } from "../../ui/IconButton";
import { SoftCard } from "../../ui/SoftCard";
import styles from "./SettingsModal.styles";
import SettingRow from "./components/SettingRow";
import { SettingsModalProps } from "./settings.types";

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
