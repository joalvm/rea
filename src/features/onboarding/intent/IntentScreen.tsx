import { Activity, Baby, Heart, ShieldCheck } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { isPregnancyMode, type ReproductiveMode } from "@/db/enums/reproductiveMode";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { SelectableCard } from "../shared/components/selectable-card/SelectableCard";
import { useIntentStyles } from "./IntentStyle";

type MasterKey = "cycle" | "pregnancy";

const MASTERS: readonly { key: MasterKey; Icon: LucideIcon }[] = [
    { key: "cycle", Icon: Activity },
    { key: "pregnancy", Icon: Baby },
];

const MODIFIERS: readonly {
    key: "avoid" | "ttc";
    reproductiveMode: ReproductiveMode;
    Icon: LucideIcon;
}[] = [
    { key: "avoid", reproductiveMode: "tracking_avoid_pregnancy", Icon: ShieldCheck },
    { key: "ttc", reproductiveMode: "tracking_ttc", Icon: Heart },
];

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/**
 * Paso 3: intención reproductiva en dos niveles. La usuaria elige un maestro —
 * seguir su ciclo o su embarazo. "Conocer mi ciclo" es el default implícito del
 * maestro de ciclo (`tracking_only`), así que solo se ofrecen dos modificadores
 * opcionales: evitar o buscar embarazo. Tocar un modificador activo lo desactiva
 * (vuelve a `tracking_only`). La selección se guarda como un único
 * `reproductive_mode`.
 */
export default function IntentScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const styles = useIntentStyles();
    const intent = useOnboardingStore((state) => state.draft.intent);
    const setIntent = useOnboardingStore((state) => state.setIntent);

    const mode = intent?.reproductiveMode ?? null;
    const master: MasterKey | null = mode ? (isPregnancyMode(mode) ? "pregnancy" : "cycle") : null;
    const showModifiers = master === "cycle";
    const selectedModifier =
        showModifiers && (mode === "tracking_avoid_pregnancy" || mode === "tracking_ttc") ? mode : null;

    const selectMaster = (key: MasterKey) => {
        if (key === "pregnancy") {
            setIntent({ reproductiveMode: "pregnancy_tracking" });
            return;
        }
        // "Conocer mi ciclo" es el default implícito; preserva un modificador ya activo.
        if (mode === null || isPregnancyMode(mode)) {
            setIntent({ reproductiveMode: "tracking_only" });
        }
    };

    const selectModifier = (reproductiveMode: ReproductiveMode) => {
        // Toggle: si el modificador ya está activo, vuelve al default neutral.
        setIntent({ reproductiveMode: mode === reproductiveMode ? "tracking_only" : reproductiveMode });
    };

    const submit = () => {
        if (!intent) {
            return;
        }
        onPush(isPregnancyMode(intent.reproductiveMode) ? "/(onboarding)/pregnancy-setup" : "/(onboarding)/cycle");
    };

    return (
        <OnboardingScreen
            progress={0.3}
            step={3}
            total={10}
            onBack={onBack}
            cta={{ label: tCommon("action.continue"), onPress: submit, disabled: !intent }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("intent.title")}</ScreenTitle>
                <ScreenLead>{t("intent.lead")}</ScreenLead>
            </View>

            <View style={styles.masters}>
                {MASTERS.map(({ key, Icon }) => (
                    <SelectableCard
                        key={key}
                        title={t(`intent.master.${key}.title`)}
                        subtitle={t(`intent.master.${key}.subtitle`)}
                        Icon={Icon}
                        selected={master === key}
                        onPress={() => selectMaster(key)}
                        testID={`intent-master-${key}`}
                    />
                ))}
            </View>

            {showModifiers ? (
                <Animated.View entering={FadeIn.duration(220)} style={styles.modifiers}>
                    <Text style={styles.modifierLabel}>{t("intent.modifierLabel")}</Text>
                    <Text style={styles.modifierHint}>{t("intent.modifierHint")}</Text>
                    <View style={styles.modifierList}>
                        {MODIFIERS.map(({ key, reproductiveMode, Icon }) => (
                            <SelectableCard
                                key={key}
                                title={t(`intent.${key}.title`)}
                                subtitle={t(`intent.${key}.subtitle`)}
                                Icon={Icon}
                                selected={selectedModifier === reproductiveMode}
                                onPress={() => selectModifier(reproductiveMode)}
                                testID={`intent-mod-${key}`}
                            />
                        ))}
                    </View>
                </Animated.View>
            ) : null}
        </OnboardingScreen>
    );
}
