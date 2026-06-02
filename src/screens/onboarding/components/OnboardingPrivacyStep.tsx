import { Text } from "react-native";
import { useTranslation } from "react-i18next";

import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

/** Muestra la introducción privada y local del onboarding. */
export default function OnboardingPrivacyStep() {
    const { t } = useTranslation("onboarding");

    return (
        <StepShell icon="shield-check-outline" subtitle={t("privacy.subtitle")} title={t("privacy.title")}>
            <Text style={styles.body}>{t("privacy.bodyEstimate")}</Text>
            <Text style={styles.body}>{t("privacy.bodyImport")}</Text>
        </StepShell>
    );
}
