import { BellRing, ShieldAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { WheelGroup } from "@/components/wheel-group/WheelGroup";
import { WheelPicker } from "@/components/wheel-picker/WheelPicker";
import { ToggleRow } from "@/components/toggle-row/ToggleRow";
import { useTheme } from "@/theme/useTheme";
import { hourLabels } from "@/shared/utils/ymd";
import { getReminderHourIndex } from "@/shared/schemas/reminder/getReminderHourIndex";
import { defaultReminderSettings, reminderIntervalHoursOptions } from "@/shared/schemas/reminder/reminderDefaults";

import { useAppSettings } from "./hooks/useAppSettings";
import { useNotificationPermission } from "./hooks/useNotificationPermission";
import { useUpdateReminderSettings } from "./hooks/useUpdateReminderSettings";
import { useSettingsNotificationsStyles } from "./SettingsNotificationsStyle";

const HOURS = hourLabels(0, 23);

/** Configuración: recordatorios locales (master, ventana, intervalo, discreción). */
export default function SettingsNotificationsScreen() {
    const { t } = useTranslation("notifications");
    const theme = useTheme();
    const styles = useSettingsNotificationsStyles();
    const { settings } = useAppSettings();
    const permission = useNotificationPermission();
    const { update } = useUpdateReminderSettings();

    const remindersEnabled = settings?.remindersEnabled ?? defaultReminderSettings.remindersEnabled;
    const intervalHours = settings?.reminderIntervalHours ?? defaultReminderSettings.reminderIntervalHours;
    const windowStart = settings?.reminderWindowStart ?? defaultReminderSettings.reminderWindowStart;
    const windowEnd = settings?.reminderWindowEnd ?? defaultReminderSettings.reminderWindowEnd;
    const notifyDailyCheckin = settings?.notifyDailyCheckin ?? defaultReminderSettings.notifyDailyCheckin;
    const discreet = settings?.discreetNotifications ?? defaultReminderSettings.discreetNotifications;

    const permissionDenied = permission.granted === false && remindersEnabled;

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("screen.title")}</Text>
            <Text style={styles.lead}>{t("screen.lead")}</Text>

            {permissionDenied ? (
                <Pressable style={styles.notice} onPress={() => Linking.openSettings()} accessibilityRole="button">
                    <ShieldAlert size={20} color={theme.colors.warning} strokeWidth={2.2} />
                    <View style={styles.noticeBody}>
                        <Text style={styles.noticeTitle}>{t("screen.permissionDenied.title")}</Text>
                        <Text style={styles.noticeText}>{t("screen.permissionDenied.subtitle")}</Text>
                        <Text style={styles.noticeAction}>{t("screen.permissionDenied.action")}</Text>
                    </View>
                </Pressable>
            ) : null}

            <ToggleRow
                Icon={BellRing}
                title={t("screen.master.title")}
                subtitle={t("screen.master.subtitle")}
                value={remindersEnabled}
                onChange={(value) => update({ remindersEnabled: value })}
                testID="settings-notifications-master"
            />

            {remindersEnabled ? (
                <View style={styles.detail}>
                    <View style={styles.windowGroup}>
                        <Text style={styles.fieldLabel}>{t("screen.windowLabel")}</Text>
                        <WheelGroup>
                            <WheelPicker
                                items={HOURS}
                                valueIndex={getReminderHourIndex(
                                    windowStart,
                                    defaultReminderSettings.reminderWindowStart,
                                )}
                                onChange={(index) =>
                                    update({
                                        reminderWindowStart: `${String(index).padStart(2, "0")}:00`,
                                    })
                                }
                                testID="settings-notifications-window-start"
                            />
                            <WheelPicker
                                items={HOURS}
                                valueIndex={getReminderHourIndex(windowEnd, defaultReminderSettings.reminderWindowEnd)}
                                onChange={(index) =>
                                    update({
                                        reminderWindowEnd: `${String(index).padStart(2, "0")}:00`,
                                    })
                                }
                                testID="settings-notifications-window-end"
                            />
                        </WheelGroup>
                    </View>

                    <View style={styles.intervalGroup}>
                        <Text style={styles.fieldLabel}>{t("screen.intervalLabel")}</Text>
                        <View style={styles.segmented}>
                            {reminderIntervalHoursOptions.map((value) => {
                                const active = value === intervalHours;
                                return (
                                    <Pressable
                                        key={value}
                                        onPress={() => update({ reminderIntervalHours: value })}
                                        style={[styles.segment, active && styles.segmentActive]}
                                        testID={`settings-notifications-interval-${value}`}
                                    >
                                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                            {t(`interval.${value}h`)}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <ToggleRow
                        title={t("screen.dailyCheckin.title")}
                        subtitle={t("screen.dailyCheckin.subtitle")}
                        value={notifyDailyCheckin}
                        onChange={(value) => update({ notifyDailyCheckin: value })}
                        testID="settings-notifications-daily-checkin"
                    />

                    <ToggleRow
                        title={t("screen.discreet.title")}
                        subtitle={t("screen.discreet.subtitle")}
                        value={discreet}
                        onChange={(value) => update({ discreetNotifications: value })}
                        testID="settings-notifications-discreet"
                    />
                </View>
            ) : null}
        </ScrollView>
    );
}
