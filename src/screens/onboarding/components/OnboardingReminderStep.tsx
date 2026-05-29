import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";
import { NotificationMoment } from "@/types/notifications.types";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

interface OnboardingReminderStepProps {
    moments: NotificationMoment[];
    onToggleMoment: (id: string) => void;
}

/** Permite activar o desactivar los recordatorios iniciales. */
export default function OnboardingReminderStep({ moments, onToggleMoment }: OnboardingReminderStepProps) {
    return (
        <StepShell
            icon="bell-outline"
            subtitle="Podrás cambiarlo en Ajustes. Nada sensible aparece en la notificación."
            title="Preguntas suaves"
        >
            <View style={styles.reminders}>
                {moments.map((moment) => (
                    <Pressable
                        key={moment.id}
                        onPress={() => onToggleMoment(moment.id)}
                        style={[styles.reminder, moment.enabled && styles.reminderActive]}
                    >
                        <View>
                            <Text style={styles.reminderTitle}>{moment.label}</Text>
                            <Text style={styles.reminderMeta}>{moment.time}</Text>
                        </View>
                        <MaterialCommunityIcons
                            color={moment.enabled ? colors.primaryDeep : colors.muted}
                            name={moment.enabled ? "toggle-switch" : "toggle-switch-off-outline"}
                            size={32}
                        />
                    </Pressable>
                ))}
            </View>
        </StepShell>
    );
}
