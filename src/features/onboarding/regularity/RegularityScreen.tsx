import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Regularity } from "@/db/enums/reproductiveMode";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import type { RegularitySelection } from "@/features/onboarding/shared/types/OnboardingDraft";
import { getRegularitySelection } from "@/features/onboarding/shared/utils/getRegularitySelection";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { SelectableCard } from "../shared/components/selectable-card/SelectableCard";
import { useRegularityStyles } from "./RegularityStyle";

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

type Option = {
    key: RegularitySelection;
    value: Regularity;
};

const OPTIONS: readonly Option[] = [
    { key: "regular", value: "regular" },
    { key: "variable", value: "variable" },
    { key: "irregular", value: "irregular" },
    { key: "unsure", value: "irregular" },
];

/** Paso 5: regularidad declarada. "Aún no lo sé" mapea a `irregular` (UI distinta). */
export default function RegularityScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useRegularityStyles();
    const intent = useOnboardingStore((state) => state.draft.intent);
    const regularity = useOnboardingStore((state) => state.draft.regularity);
    const regularitySelection = useOnboardingStore((state) => state.draft.regularitySelection);
    const set = useOnboardingStore((state) => state.set);

    const selectedKey = getRegularitySelection({ regularity, regularitySelection });

    const choose = (option: Option) => {
        set({ regularity: option.value, regularitySelection: option.key });
    };

    const submit = () => {
        if (!intent) {
            onPush("/(onboarding)/intent");
            return;
        }

        onPush("/(onboarding)/last-period");
    };

    return (
        <OnboardingScreen
            progress={0.58}
            step={5}
            total={10}
            onBack={onBack}
            cta={{ label: t("cta.continue"), onPress: submit }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("regularity.title")}</ScreenTitle>
                <ScreenLead>{t("regularity.lead")}</ScreenLead>
            </View>

            <View style={styles.grid}>
                {OPTIONS.map((option) => (
                    <View key={option.key} style={styles.cardWrap}>
                        <SelectableCard
                            title={t(`regularity.${option.key}.title`)}
                            subtitle={t(`regularity.${option.key}.subtitle`)}
                            selected={selectedKey === option.key}
                            onPress={() => choose(option)}
                            testID={`regularity-${option.key}`}
                        />
                    </View>
                ))}
            </View>
        </OnboardingScreen>
    );
}
