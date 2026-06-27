import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useCycleStyles } from "./CycleStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: duración del sangrado y del ciclo (declared_period_length / declared_cycle_length). Ver README. */
export default function CycleScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useCycleStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("cycle.title")}</Text>
            <Text style={styles.description}>{t("cycle.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
