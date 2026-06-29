import { TriangleAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { SegmentedControl } from "../shared/components/segmented-control/SegmentedControl";
import { useContraceptionStyles } from "./ContraceptionStyle";

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/** Paso 7 (solo tracking_only): anticoncepción hormonal. */
export default function ContraceptionScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useContraceptionStyles();
    const hormonal = useOnboardingStore((state) => state.draft.hormonalContraception);
    const set = useOnboardingStore((state) => state.set);

    return (
        <OnboardingScreen
            progress={0.78}
            step={7}
            total={10}
            onBack={onBack}
            cta={{ label: tCommon("action.continue"), onPress: () => onPush("/(onboarding)/notifications") }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("contraception.title")}</ScreenTitle>
                <ScreenLead>{t("contraception.lead")}</ScreenLead>
            </View>

            <SegmentedControl
                options={[
                    { value: false, label: t("contraception.no") },
                    { value: true, label: t("contraception.yes") },
                ]}
                value={hormonal}
                onChange={(value) => set({ hormonalContraception: value })}
                testID="contraception-seg"
            />

            <View style={styles.warningBox}>
                <TriangleAlert size={18} color={theme.colors.warningText} strokeWidth={2.2} />
                <Text style={styles.warningText}>{t("contraception.warning")}</Text>
            </View>
        </OnboardingScreen>
    );
}
