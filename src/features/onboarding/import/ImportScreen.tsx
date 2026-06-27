import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useImportStyles } from "./ImportStyle";

type Props = {
    onContinue: () => void;
    onBack: () => void;
};

/** Onboarding (alternativo): importar copia de seguridad y validar datos. Ver README. */
export default function ImportScreen({ onContinue, onBack }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useImportStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("import.title")}</Text>
            <Text style={styles.description}>{t("import.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                onPress={onBack}
            >
                <Text style={styles.secondaryText}>{t("actions.back")}</Text>
            </Pressable>
        </ScrollView>
    );
}
