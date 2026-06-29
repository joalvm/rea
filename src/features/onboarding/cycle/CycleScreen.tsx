import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";

import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { HelpText } from "../shared/components/help-text/HelpText";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { Stepper } from "../shared/components/stepper/Stepper";
import { useCycleStyles } from "./CycleStyle";

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/** Paso 4: duración declarada del ciclo y del sangrado (punto de partida). */
export default function CycleScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const styles = useCycleStyles();
    const cycleLength = useOnboardingStore((state) => state.draft.cycleLength);
    const periodLength = useOnboardingStore((state) => state.draft.periodLength);
    const set = useOnboardingStore((state) => state.set);

    return (
        <OnboardingScreen
            progress={0.45}
            step={4}
            total={10}
            onBack={onBack}
            cta={{ label: tCommon("action.continue"), onPress: () => onPush("/(onboarding)/regularity") }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("cycle.title")}</ScreenTitle>
                <ScreenLead>{t("cycle.lead")}</ScreenLead>
            </View>

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("cycle.periodLabel")}</FieldLabel>
                <Stepper
                    value={periodLength}
                    min={1}
                    max={15}
                    unit={t("cycle.days")}
                    onChange={(value) => set({ periodLength: value })}
                    testID="cycle-period"
                />
            </View>

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("cycle.cycleLabel")}</FieldLabel>
                <Stepper
                    value={cycleLength}
                    min={15}
                    max={90}
                    unit={t("cycle.days")}
                    onChange={(value) => set({ cycleLength: value })}
                    testID="cycle-length"
                />
            </View>

            <HelpText>{t("cycle.help")}</HelpText>
        </OnboardingScreen>
    );
}
