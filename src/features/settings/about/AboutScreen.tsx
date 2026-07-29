import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { ScrollView, Text } from "react-native";

import { useAboutStyles } from "./AboutStyle";

/** Identidad de la app y límites médicos/privacidad visibles para la usuaria. */
export default function AboutScreen() {
    const { t } = useTranslation("settings");
    const styles = useAboutStyles();
    const version = Constants.expoConfig?.version ?? "—";

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("aboutTitle")}</Text>
            <Text style={styles.description}>{t("aboutDescription")}</Text>
            <Text style={styles.description}>{t("version", { value: version })}</Text>
            <Text style={styles.description}>{t("medicalDisclaimer")}</Text>
        </ScrollView>
    );
}
