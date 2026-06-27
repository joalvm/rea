import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useNotificationsStyles } from "./NotificationsStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ventana e intervalo de recordatorios (user_profile.reminder_*). Ver README. */
export default function NotificationsScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useNotificationsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("notifications.title")}</Text>
            <Text style={styles.description}>{t("notifications.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
