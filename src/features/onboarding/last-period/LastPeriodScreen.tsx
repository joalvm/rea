import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useLastPeriodStyles } from "./LastPeriodStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: inicio (y fin opcional) del último periodo → crea el primer period_run. Ver README. */
export default function LastPeriodScreen({ onContinue }: Props) {
    const { t } = useTranslation("preview");
    const styles = useLastPeriodStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("lastPeriod.title")}</Text>
            <Text style={styles.description}>{t("lastPeriod.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
