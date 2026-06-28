import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { useWelcomeStyles } from "./WelcomeStyle";

type Props = {
    onReplace: (href: string) => void;
};

/** Paso 1: bienvenida + promesa de privacidad. */
export default function WelcomeScreen({ onReplace }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useWelcomeStyles();

    return (
        <OnboardingScreen
            progress={0.06}
            center
            cta={{ label: t("cta.start"), onPress: () => onReplace("/(onboarding)/profile") }}
        >
            <Text style={styles.wordmark}>{t("welcome.wordmark")}</Text>
            <Text style={styles.tagline}>{t("welcome.tagline")}</Text>
            <View style={styles.spacer} />
            <ScreenTitle>{t("welcome.title")}</ScreenTitle>
            <ScreenLead>{t("welcome.body")}</ScreenLead>
            <View style={styles.deviceChip}>
                <Text style={styles.deviceChipText}>{t("welcome.deviceChip")}</Text>
            </View>
        </OnboardingScreen>
    );
}
