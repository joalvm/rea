import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useGoalStyles } from "./GoalStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ¿busca embarazo? (trying_to_conceive). Oculto si usa anticoncepción hormonal. Ver README. */
export default function GoalScreen({ onContinue }: Props) {
    const { t } = useTranslation("preview");
    const styles = useGoalStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("goal.title")}</Text>
            <Text style={styles.description}>{t("goal.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
