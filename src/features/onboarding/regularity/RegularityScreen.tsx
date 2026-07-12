import type { LucideIcon } from "lucide-react-native";
import { Activity, CalendarCheck, CalendarRange, HelpCircle, Waves } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";

import type { Regularity } from "@/db/enums/reproductiveMode";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import type { RegularitySelection } from "@/features/onboarding/shared/types/OnboardingDraft";
import { getRegularitySelection } from "@/features/onboarding/shared/utils/getRegularitySelection";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { SelectableCard } from "@/components/selectable-card/SelectableCard";
import { regularitySchema } from "./schemas/regularitySchema";
import { useRegularityStyles } from "./RegularityStyle";

type Props = {
    onPush: (href: string) => void;
};

type Option = {
    key: RegularitySelection;
    value: Regularity;
    Icon: LucideIcon;
};

const OPTIONS: readonly Option[] = [
    { key: "regular", value: "regular", Icon: CalendarCheck },
    { key: "variable", value: "variable", Icon: Waves },
    { key: "irregular", value: "irregular", Icon: Activity },
    { key: "unsure", value: "irregular", Icon: HelpCircle },
];

/** Paso 5: regularidad declarada. "Aún no lo sé" mapea a `irregular` (UI distinta). */
export default function RegularityScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
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

        const result = regularitySchema.safeParse({ regularity });

        if (!result.success) {
            Alert.alert(tValidation("onboarding.invalidRegularity"));
            return;
        }

        onPush("/(onboarding)/last-period");
    };

    return (
        <OnboardingScreen step={5} total={9} cta={{ label: tCommon("action.continue"), onPress: submit }}>
            <ScreenHeader Icon={CalendarRange} title={t("regularity.title")} lead={t("regularity.lead")} />

            <View style={styles.list}>
                {OPTIONS.map((option) => (
                    <SelectableCard
                        key={option.key}
                        title={t(`regularity.${option.key}.title`)}
                        subtitle={t(`regularity.${option.key}.subtitle`)}
                        Icon={option.Icon}
                        selected={selectedKey === option.key}
                        onPress={() => choose(option)}
                        testID={`regularity-${option.key}`}
                    />
                ))}
            </View>
        </OnboardingScreen>
    );
}
