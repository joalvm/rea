import { BellRing, Info } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { useCompleteStyles } from "@/features/onboarding/complete/CompleteStyle";
import { useCompleteOnboarding } from "@/features/onboarding/complete/hooks/useCompleteOnboarding";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { useTheme } from "@/theme/useTheme";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ReaIllustration } from "../shared/components/rea-illustration/ReaIllustration";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";

type Props = {
    onReplace: (href: string) => void;
};

/** Paso 10: cierre. Persiste todo en una transacción y redirige a la app. */
export default function CompleteScreen({ onReplace }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useCompleteStyles();
    const remindersEnabled = useOnboardingStore((state) => state.draft.remindersEnabled);
    const { submitCompleteOnboarding, isSubmitting } = useCompleteOnboarding();

    async function handleStartApp() {
        const didComplete = await submitCompleteOnboarding();
        if (!didComplete) {
            return;
        }

        onReplace("/(tabs)");
    }

    return (
        <OnboardingScreen
            step={9}
            total={9}
            center
            cta={{ label: tCommon("action.startApp"), onPress: handleStartApp, disabled: isSubmitting }}
        >
            <View style={styles.brand}>
                <Text style={styles.wordmark}>{t("complete.wordmark")}</Text>
                <Text style={styles.tagline}>{t("complete.tagline")}</Text>
            </View>
            <ReaIllustration variant="complete" />
            <ScreenTitle center>{t("complete.title")}</ScreenTitle>
            <ScreenLead center>{t("complete.lead")}</ScreenLead>

            <View style={styles.disclaimerBox}>
                <Info size={18} color={theme.colors.link} strokeWidth={2.2} />
                <Text style={styles.disclaimerText}>{t("complete.disclaimer")}</Text>
            </View>

            {remindersEnabled ? (
                <View style={styles.disclaimerBox}>
                    <BellRing size={18} color={theme.colors.link} strokeWidth={2.2} />
                    <View>
                        <Text style={styles.disclaimerText}>{t("complete.permissionTitle")}</Text>
                        <Text style={styles.disclaimerText}>{t("complete.permissionBody")}</Text>
                    </View>
                </View>
            ) : null}
        </OnboardingScreen>
    );
}
