import { ShieldCheck, TriangleAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { SegmentedControl } from "../shared/components/segmented-control/SegmentedControl";
import { useContraceptionStyles } from "./ContraceptionStyle";

type Props = {
    onPush: (href: string) => void;
};

/** Paso 7 (solo tracking_only): anticoncepción hormonal. */
export default function ContraceptionScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useContraceptionStyles();
    const hormonal = useOnboardingStore((state) => state.draft.hormonalContraception);
    const set = useOnboardingStore((state) => state.set);

    return (
        <OnboardingScreen
            step={7}
            total={9}
            cta={{ label: tCommon("action.continue"), onPress: () => onPush("/(onboarding)/notifications") }}
        >
            <ScreenHeader Icon={ShieldCheck} title={t("contraception.title")} lead={t("contraception.lead")} />

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
