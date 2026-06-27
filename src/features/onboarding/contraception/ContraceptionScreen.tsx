import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useContraceptionStyles } from "./ContraceptionStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: anticoncepción hormonal (hormonal_contraception). Condiciona fertilidad/TTC. Ver README. */
export default function ContraceptionScreen({ onContinue }: Props) {
    const { t } = useTranslation("preview");
    const styles = useContraceptionStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("contraception.title")}</Text>
            <Text style={styles.description}>{t("contraception.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
