import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import notificationCadenceSummary from "@/modules/notifications/utils/notificationCadenceSummary";
import { colors } from "@/theme";
import { NotificationCadence } from "@/types/notifications.types";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

interface OnboardingReminderStepProps {
    cadence: NotificationCadence;
    onToggleEnabled: () => void;
}

/** Permite activar o desactivar los recordatorios iniciales. */
export default function OnboardingReminderStep({ cadence, onToggleEnabled }: OnboardingReminderStepProps) {
    const { t } = useTranslation("onboarding");

    return (
        <StepShell icon="bell-outline" subtitle={t("reminders.subtitle")} title={t("reminders.title")}>
            <View style={styles.reminders}>
                <Pressable
                    onPress={onToggleEnabled}
                    style={[styles.reminder, cadence.enabled && styles.reminderActive]}
                >
                    <View>
                        <Text style={styles.reminderTitle}>
                            {cadence.enabled ? t("reminders.active") : t("reminders.paused")}
                        </Text>
                        <Text style={styles.reminderMeta}>{notificationCadenceSummary(cadence)}</Text>
                    </View>
                    <MaterialCommunityIcons
                        color={cadence.enabled ? colors.primaryDeep : colors.muted}
                        name={cadence.enabled ? "toggle-switch" : "toggle-switch-off-outline"}
                        size={32}
                    />
                </Pressable>
            </View>
        </StepShell>
    );
}
