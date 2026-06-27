import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useCompleteStyles } from "./CompleteStyle";

type Props = {
    onFinish: () => void;
};

/**
 * Último paso del onboarding: disclaimer + arranque.
 * Persiste perfil + intención reproductiva + primer periodo y sella
 * `user_profile.onboarding_completed_at`. Ver README de la feature.
 */
export default function CompleteScreen({ onFinish }: Props) {
    const { t } = useTranslation("preview");
    const styles = useCompleteStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("complete.title")}</Text>
            <Text style={styles.description}>{t("complete.disclaimer")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onFinish}
            >
                <Text style={styles.primaryText}>{t("complete.finish")}</Text>
            </Pressable>
        </ScrollView>
    );
}
