import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { colors, surfaces } from "@/theme";
import { IconButton } from "@/ui/IconButton";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./SettingsModal.styles";
import ExportSavedBanner from "./components/ExportSavedBanner";
import SettingRow from "./components/SettingRow";

import { NotificationMoment } from "@/types/notifications.types";
import { ExportSavedNotice } from "./settings.types";

/** Props del modal principal de ajustes. */
interface SettingsModalProps {
    visible: boolean;
    exportSavedNotice: ExportSavedNotice | null;
    exportingBackup: boolean;
    importingBackup: boolean;
    moments: NotificationMoment[];
    onClose: () => void;
    onDismissExportSavedNotice: () => void;
    onExportBackup: () => Promise<void>;
    onImportBackup: () => Promise<void>;
    onOpenSchedule: () => void;
    onReset: () => Promise<void>;
    onShareSavedBackup: () => Promise<void>;
}

export function SettingsModal({
    visible,
    exportSavedNotice,
    exportingBackup,
    importingBackup,
    moments,
    onClose,
    onDismissExportSavedNotice,
    onExportBackup,
    onImportBackup,
    onOpenSchedule,
    onReset,
    onShareSavedBackup,
}: SettingsModalProps) {
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
                    <ScreenHeader
                        kicker="Ajustes"
                        leading={
                            <IconButton
                                backgroundColor={surfaces.cardRaised}
                                icon="chevron-left"
                                label="Cerrar ajustes"
                                onPress={onClose}
                            />
                        }
                        subtitle="Recordatorios, respaldo y privacidad local en un solo lugar."
                        title="Tu espacio, a tu ritmo"
                    />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <SettingRow
                        icon="bell-outline"
                        meta={`${activeMoments} activos`}
                        onPress={onOpenSchedule}
                        text="Elige cuándo quieres recibir una pregunta corta."
                        title="Momentos del día"
                    />

                    <SettingRow
                        icon="database-export-outline"
                        meta={exportingBackup ? "Preparando" : ".rea"}
                        onPress={() => {
                            void onExportBackup();
                        }}
                        text="Guarda una copia local y abre el panel para compartirla."
                        title="Exportar respaldo"
                    />

                    <SettingRow
                        icon="database-import-outline"
                        meta={importingBackup ? "Buscando" : "Abrir archivo"}
                        onPress={() => {
                            void onImportBackup();
                        }}
                        text="Abre un respaldo guardado y confirma antes de reemplazar los datos actuales."
                        title="Importar respaldo"
                    />

                    <SoftCard style={styles.privacyCard} tone="primary" variant="soft">
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

                    <SoftCard style={styles.resetCard} tone="period" variant="soft">
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

                    <Text style={styles.referenceNote}>
                        Cómo leer Rea: Observado sale de lo que registras. Estimado usa el calendario como referencia.
                    </Text>
                </ScrollView>

                {exportSavedNotice ? (
                    <ExportSavedBanner
                        message={exportSavedNotice.message}
                        onDismiss={onDismissExportSavedNotice}
                        onShare={
                            exportSavedNotice.canShare
                                ? () => {
                                      void onShareSavedBackup();
                                  }
                                : undefined
                        }
                    />
                ) : null}
            </View>
        </Modal>
    );
}
