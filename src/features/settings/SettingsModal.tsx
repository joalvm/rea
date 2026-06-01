import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";

import notificationCadenceSummary from "@/modules/notifications/utils/notificationCadenceSummary";
import { colors, surfaces } from "@/theme";
import { IconButton } from "@/ui/IconButton";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./SettingsModal.styles";
import ExportSavedBanner from "./components/ExportSavedBanner";
import SettingRow from "./components/SettingRow";

import { NotificationCadence } from "@/types/notifications.types";
import { AppSettings } from "@/types/settings.types";
import { ExportSavedNotice } from "./settings.types";

/** Props del modal principal de ajustes. */
interface SettingsModalProps {
    visible: boolean;
    exportSavedNotice: ExportSavedNotice | null;
    exportingBackup: boolean;
    importingBackup: boolean;
    notificationCadence: NotificationCadence;
    settings: AppSettings | null;
    onClose: () => void;
    onDismissExportSavedNotice: () => void;
    onExportBackup: () => Promise<void>;
    onGenerateDevelopmentData: () => Promise<void>;
    onImportBackup: () => Promise<void>;
    onOpenSchedule: () => void;
    onReset: () => Promise<void>;
    onSaveSettings: (settings: AppSettings) => Promise<void>;
    onShareSavedBackup: () => Promise<void>;
}

export function SettingsModal({
    visible,
    exportSavedNotice,
    exportingBackup,
    importingBackup,
    notificationCadence,
    settings,
    onClose,
    onDismissExportSavedNotice,
    onExportBackup,
    onGenerateDevelopmentData,
    onImportBackup,
    onOpenSchedule,
    onReset,
    onSaveSettings,
    onShareSavedBackup,
}: SettingsModalProps) {
    const [seedingDevelopmentData, setSeedingDevelopmentData] = useState(false);
    const cadenceMeta = notificationCadenceSummary(notificationCadence);
    const goalMeta = settings?.tryingToConceive ? "Ciclo + búsqueda" : "Solo ciclo";
    const goalText = settings?.tryingToConceive
        ? "Entender tu ciclo sigue activo y también se suma contexto de ventana probable cuando hay base suficiente."
        : "Entender tu ciclo ya viene activo. Si quieres, puedes sumar búsqueda de embarazo sin cambiar resto de Rea.";

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

    const manageGoal = () => {
        if (!settings) {
            return;
        }

        const nextTryingToConceive = !settings.tryingToConceive;
        const nextText = nextTryingToConceive
            ? "Se suma capa de ventana probable y lecturas relacionadas, sin prometer precisión clínica."
            : "Rea vuelve a quedarse solo con lectura general de ciclo y bienestar.";

        Alert.alert(nextTryingToConceive ? "Sumar búsqueda de embarazo" : "Volver a solo entender tu ciclo", nextText, [
            { text: "Cancelar", style: "cancel" },
            {
                text: nextTryingToConceive ? "Activar" : "Quitar",
                onPress: () => {
                    void onSaveSettings({ ...settings, tryingToConceive: nextTryingToConceive });
                },
            },
        ]);
    };

    const runDevelopmentSeed = async () => {
        setSeedingDevelopmentData(true);
        try {
            await onGenerateDevelopmentData();
        } finally {
            setSeedingDevelopmentData(false);
        }
    };

    const confirmDevelopmentSeed = () => {
        Alert.alert(
            "Generar usuaria fake",
            "Reemplaza datos actuales por historial largo y coherente para probar Hoy, Patrones, Diario y Calendario.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Generar",
                    onPress: () => {
                        void runDevelopmentSeed();
                    },
                },
            ],
        );
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
                    {settings ? (
                        <SettingRow
                            icon="compass-outline"
                            meta={goalMeta}
                            onPress={manageGoal}
                            text={goalText}
                            title="Enfoque activo"
                        />
                    ) : null}

                    <SettingRow
                        icon="bell-outline"
                        meta={cadenceMeta}
                        onPress={onOpenSchedule}
                        text="Elige cada cuánto quieres recibir una pregunta corta dentro de tu ventana activa."
                        title="Recordatorios"
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

                    {__DEV__ ? (
                        <SettingRow
                            icon="flask-outline"
                            meta={seedingDevelopmentData ? "Generando" : "Solo dev"}
                            onPress={confirmDevelopmentSeed}
                            text="Genera historial largo de una usuaria de prueba para revisar estados maduros de producto sin cargar todo a mano."
                            title="Usuaria fake"
                        />
                    ) : null}

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
