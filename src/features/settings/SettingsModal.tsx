import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation("settings");
    const [seedingDevelopmentData, setSeedingDevelopmentData] = useState(false);
    const cadenceMeta = notificationCadenceSummary(notificationCadence);
    const goalMeta = settings?.tryingToConceive ? t("goal.activeMeta") : t("goal.inactiveMeta");
    const goalText = settings?.tryingToConceive ? t("goal.activeText") : t("goal.inactiveText");

    const confirmReset = () => {
        Alert.alert(t("reset.title"), t("reset.body"), [
            { text: t("common:actions.cancel"), style: "cancel" },
            {
                text: t("reset.confirm"),
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
        const nextText = nextTryingToConceive ? t("goal.enableBody") : t("goal.removeBody");

        Alert.alert(nextTryingToConceive ? t("goal.enableTitle") : t("goal.removeTitle"), nextText, [
            { text: t("common:actions.cancel"), style: "cancel" },
            {
                text: nextTryingToConceive ? t("goal.activate") : t("goal.disable"),
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
        Alert.alert(t("developmentSeed.title"), t("developmentSeed.body"), [
            { text: t("common:actions.cancel"), style: "cancel" },
            {
                text: t("developmentSeed.confirm"),
                onPress: () => {
                    void runDevelopmentSeed();
                },
            },
        ]);
    };

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <ScreenHeader
                        kicker={t("header.kicker")}
                        leading={
                            <IconButton
                                backgroundColor={surfaces.cardRaised}
                                icon="chevron-left"
                                label={t("header.close")}
                                onPress={onClose}
                            />
                        }
                        subtitle={t("header.subtitle")}
                        title={t("header.title")}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {settings ? (
                        <SettingRow
                            icon="compass-outline"
                            meta={goalMeta}
                            onPress={manageGoal}
                            text={goalText}
                            title={t("goal.title")}
                        />
                    ) : null}

                    <SettingRow
                        icon="bell-outline"
                        meta={cadenceMeta}
                        onPress={onOpenSchedule}
                        text={t("rows.reminders.text")}
                        title={t("rows.reminders.title")}
                    />

                    <SettingRow
                        icon="database-export-outline"
                        meta={exportingBackup ? t("rows.exportBackup.metaLoading") : t("rows.exportBackup.meta")}
                        onPress={() => {
                            void onExportBackup();
                        }}
                        text={t("rows.exportBackup.text")}
                        title={t("rows.exportBackup.title")}
                    />

                    <SettingRow
                        icon="database-import-outline"
                        meta={importingBackup ? t("rows.importBackup.metaLoading") : t("rows.importBackup.meta")}
                        onPress={() => {
                            void onImportBackup();
                        }}
                        text={t("rows.importBackup.text")}
                        title={t("rows.importBackup.title")}
                    />

                    {__DEV__ ? (
                        <SettingRow
                            icon="flask-outline"
                            meta={seedingDevelopmentData ? t("developmentSeed.metaLoading") : t("developmentSeed.meta")}
                            onPress={confirmDevelopmentSeed}
                            text={t("developmentSeed.text")}
                            title={t("developmentSeed.title")}
                        />
                    ) : null}

                    <SoftCard style={styles.privacyCard} tone="primary" variant="soft">
                        <View style={styles.privacyIcon}>
                            <MaterialCommunityIcons color={colors.primaryDeep} name="shield-check-outline" size={25} />
                        </View>
                        <View style={styles.privacyCopy}>
                            <Text style={styles.cardTitle}>{t("privacy.title")}</Text>
                            <Text style={styles.cardText}>{t("privacy.body")}</Text>
                        </View>
                    </SoftCard>

                    <SoftCard style={styles.resetCard} tone="period" variant="soft">
                        <View style={styles.resetHeader}>
                            <View style={styles.resetIcon}>
                                <MaterialCommunityIcons color={colors.danger} name="refresh" size={24} />
                            </View>
                            <View style={styles.resetCopy}>
                                <Text style={styles.cardTitle}>{t("reset.title")}</Text>
                                <Text style={styles.cardText}>{t("reset.text")}</Text>
                            </View>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            onPress={confirmReset}
                            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.resetButtonText}>{t("reset.button")}</Text>
                        </Pressable>
                    </SoftCard>

                    <Text style={styles.referenceNote}>{t("privacy.reference")}</Text>
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
