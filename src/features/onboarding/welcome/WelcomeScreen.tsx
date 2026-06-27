import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useWelcomeStyles } from "./WelcomeStyle";

type Props = {
    onStart: () => void;
    onImport: () => void;
};

/** Paso 1 del onboarding: bienvenida + promesa de privacidad. Ver README de la feature. */
export default function WelcomeScreen({ onStart, onImport }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useWelcomeStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("welcome.title")}</Text>
            <Text style={styles.description}>{t("welcome.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onStart}
            >
                <Text style={styles.primaryText}>{t("welcome.start")}</Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                onPress={onImport}
            >
                <Text style={styles.secondaryText}>{t("welcome.restore")}</Text>
            </Pressable>
        </ScrollView>
    );
}
