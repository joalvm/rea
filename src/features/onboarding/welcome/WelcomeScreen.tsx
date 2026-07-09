import { Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import LogoHorizontal from "@assets/images/branding/logo-horizontal.svg";
import { useTheme } from "@/theme/useTheme";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ReaIllustration } from "../shared/components/rea-illustration/ReaIllustration";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { useWelcomeStyles } from "./WelcomeStyle";

const LOGO_WIDTH = 150;
const LOGO_RATIO = 422 / 1008; // viewBox del logo horizontal

type Props = {
    onPush: (href: string) => void;
};

/** Paso 1: bienvenida + promesa de privacidad. Bisagra ilustrada. */
export default function WelcomeScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useWelcomeStyles();

    return (
        <OnboardingScreen
            step={1}
            total={9}
            center
            cta={{ label: tCommon("action.start"), onPress: () => onPush("/(onboarding)/profile") }}
        >
            <View style={styles.brand}>
                <LogoHorizontal width={LOGO_WIDTH} height={LOGO_WIDTH * LOGO_RATIO} color={theme.colors.primary} />
                <Text style={styles.tagline}>{t("welcome.tagline")}</Text>
            </View>
            <ReaIllustration variant="welcome" />
            <ScreenTitle center>{t("welcome.title")}</ScreenTitle>
            <ScreenLead center>{t("welcome.body")}</ScreenLead>
            <View style={styles.deviceChip}>
                <Lock size={13} color={theme.colors.link} strokeWidth={2.4} />
                <Text style={styles.deviceChipText}>{t("welcome.deviceChip")}</Text>
            </View>
        </OnboardingScreen>
    );
}
