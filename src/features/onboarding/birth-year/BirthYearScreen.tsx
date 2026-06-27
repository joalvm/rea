import { Pressable, ScrollView, Text } from "react-native";

import { useTranslation } from "react-i18next";

import { useBirthYearStyles } from "./BirthYearStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: año de nacimiento (user_profile.birth_year). Solo el año. Ver README. */
export default function BirthYearScreen({ onContinue }: Props) {
    const { t } = useTranslation("preview");
    const styles = useBirthYearStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("birthYear.title")}</Text>
            <Text style={styles.description}>{t("birthYear.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
