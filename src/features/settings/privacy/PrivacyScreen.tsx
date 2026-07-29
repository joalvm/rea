import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { authenticateDevice } from "@/domain/privacy/authenticateDevice";
import { exportBackupFile } from "@/domain/backup/backupFile";
import { exportCheckinsCsvFile } from "@/domain/backup/exportCheckinsCsvFile";
import { pickBackupFile, restorePickedBackup } from "@/domain/backup/restoreBackupFile";
import { summarizeBackup } from "@/domain/backup/summarizeBackup";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useAppSettings } from "@/features/settings/notifications/hooks/useAppSettings";
import { formatDate } from "@/modules/l10n/formatDate";
import { usePrivacyStyles } from "./PrivacyStyle";
import { deleteAllLocalData } from "./services/deleteAllLocalData";
import { updatePrivacySettings } from "./services/updatePrivacySettings";

/** Centro de privacidad: cifrado, red, backup, bloqueo, discreción y borrado total. */
export default function PrivacyScreen() {
    const { t } = useTranslation("privacy");
    const styles = usePrivacyStyles();
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const { settings } = useAppSettings();

    const handleExport = async () => {
        try {
            await exportBackupFile(database, profile?.id, t("export"));
            Alert.alert(t("done"), t("exported"));
        } catch {
            Alert.alert(t("error"));
        }
    };

    const handleRestore = async () => {
        try {
            const backup = await pickBackupFile();
            if (!backup) return;
            const summary = summarizeBackup(backup);
            const range =
                summary.from && summary.to
                    ? `${formatDate(summary.from, "short")} – ${formatDate(summary.to, "short")}`
                    : t("unknownRange");
            Alert.alert(
                t("restoreTitle"),
                t("restoreBody", { cycles: summary.cycleCount, checkins: summary.checkinCount, range }),
                [
                    { text: t("cancel"), style: "cancel" },
                    {
                        text: t("restore"),
                        style: "destructive",
                        onPress: () => {
                            void restorePickedBackup(database, backup)
                                .then(() => Alert.alert(t("done"), t("restored")))
                                .catch(() => Alert.alert(t("error")));
                        },
                    },
                ],
            );
        } catch {
            Alert.alert(t("error"));
        }
    };

    const handleExportCsv = async () => {
        try {
            await exportCheckinsCsvFile(database, t("exportCsv"));
            Alert.alert(t("done"), t("exportedCsv"));
        } catch {
            Alert.alert(t("error"));
        }
    };

    const handleLock = async () => {
        try {
            const authenticated = await authenticateDevice();
            Alert.alert(authenticated ? t("done") : t("notAvailable"), authenticated ? t("locked") : t("notAvailable"));
        } catch {
            Alert.alert(t("notAvailable"));
        }
    };

    const handleDelete = () => {
        Alert.alert(t("deleteTitle"), t("deleteBody"), [
            { text: t("cancel"), style: "cancel" },
            {
                text: t("delete"),
                style: "destructive",
                onPress: () => {
                    void deleteAllLocalData(database).catch(() => Alert.alert(t("error")));
                },
            },
        ]);
    };

    const handleDiscreetCalendar = (value: boolean) => {
        if (profile) void updatePrivacySettings(database, profile.id, value).catch(() => Alert.alert(t("error")));
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("title")}</Text>
            <Text style={styles.description}>{t("description")}</Text>
            <View style={styles.links}>
                <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>{t("encryption")}</Text>
                    <Text style={styles.linkHint}>{t("encryptionBody")}</Text>
                </View>
                <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>{t("zeroNetwork")}</Text>
                    <Text style={styles.linkHint}>{t("zeroNetworkBody")}</Text>
                </View>
                <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>
                        {settings?.lastBackupAt
                            ? t("lastBackup", { date: formatDate(settings.lastBackupAt.slice(0, 10), "long") })
                            : t("neverBackup")}
                    </Text>
                    <Pressable
                        onPress={() => void handleExport()}
                        style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryText}>{t("export")}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => void handleRestore()}
                        style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryText}>{t("restore")}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => void handleExportCsv()}
                        style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryText}>{t("exportCsv")}</Text>
                    </Pressable>
                </View>
                <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>{t("discreetCalendar")}</Text>
                    <Text style={styles.linkHint}>{t("discreetCalendarBody")}</Text>
                    <Switch value={settings?.discreetCalendar ?? false} onValueChange={handleDiscreetCalendar} />
                </View>
                <Pressable
                    onPress={() => void handleLock()}
                    style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                >
                    <Text style={styles.secondaryText}>{t("lock")}</Text>
                </Pressable>
                <Pressable
                    onPress={handleDelete}
                    style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                >
                    <Text style={styles.secondaryText}>{t("delete")}</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
