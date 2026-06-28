import { Activity, Baby, Heart, ShieldCheck } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { INTENT_CHOICES, type IntentKey } from "@/features/onboarding/shared/types/OnboardingDraft";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { SelectableCard } from "../shared/components/selectable-card/SelectableCard";
import { useIntentStyles } from "./IntentStyle";

const ICONS: Record<IntentKey, LucideIcon> = {
    track: Activity,
    avoid: ShieldCheck,
    ttc: Heart,
    preg: Baby,
};

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/** Paso 3: intención reproductiva (4 cards). Bifurca el flujo (embarazo vs ciclo). */
export default function IntentScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useIntentStyles();
    const intent = useOnboardingStore((state) => state.draft.intent);
    const setIntent = useOnboardingStore((state) => state.setIntent);

    const selectedKey: IntentKey | null = intent
        ? (INTENT_CHOICES.find(
              (choice) => choice.currentMode === intent.currentMode && choice.cycleIntent === intent.cycleIntent,
          )?.key ?? null)
        : null;

    const submit = () => {
        if (!intent) {
            return;
        }
        onPush(intent.currentMode === "pregnancy" ? "/(onboarding)/pregnancy-setup" : "/(onboarding)/last-period");
    };

    return (
        <OnboardingScreen
            progress={0.3}
            step={3}
            total={10}
            onBack={onBack}
            cta={{ label: t("cta.continue"), onPress: submit, disabled: !intent }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("intent.title")}</ScreenTitle>
                <ScreenLead>{t("intent.lead")}</ScreenLead>
            </View>

            <View style={styles.grid}>
                {INTENT_CHOICES.map((choice) => (
                    <View key={choice.key} style={styles.cardWrap}>
                        <SelectableCard
                            title={t(`intent.${choice.key}.title`)}
                            subtitle={t(`intent.${choice.key}.subtitle`)}
                            Icon={ICONS[choice.key]}
                            selected={selectedKey === choice.key}
                            onPress={() =>
                                setIntent({ currentMode: choice.currentMode, cycleIntent: choice.cycleIntent })
                            }
                            testID={`intent-${choice.key}`}
                        />
                    </View>
                ))}
            </View>
        </OnboardingScreen>
    );
}
