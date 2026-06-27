import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text } from "react-native";

import { useRegularityStyles } from "./RegularityStyle";

type Props = {
    onContinue: () => void;
};

/** Onboarding: regularidad percibida (regular | variable | irregular). Ver README. */
export default function RegularityScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useRegularityStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("regularity.title")}</Text>
            <Text style={styles.description}>{t("regularity.body")}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{t("actions.continue")}</Text>
            </Pressable>
        </ScrollView>
    );
}
