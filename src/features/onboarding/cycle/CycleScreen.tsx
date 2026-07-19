import { Lightbulb, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { useTheme } from "@/theme/useTheme";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { Stepper } from "../shared/components/stepper/Stepper";
import { cycleSchema } from "./schemas/cycleSchema";
import { useCycleStyles } from "./CycleStyle";

type Props = {
    onPush: (href: string) => void;
};

/** Paso 4: duración declarada del ciclo y del sangrado (punto de partida). */
export default function CycleScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const theme = useTheme();
    const styles = useCycleStyles();
    const cycleLength = useOnboardingStore((state) => state.draft.cycleLength);
    const periodLength = useOnboardingStore((state) => state.draft.periodLength);
    const set = useOnboardingStore((state) => state.set);

    const submit = () => {
        const result = cycleSchema.safeParse({ cycleLength, periodLength });

        if (!result.success) {
            Alert.alert(tValidation("onboarding.invalidCycle"));
            return;
        }

        set(result.data);
        onPush("/(onboarding)/regularity");
    };

    return (
        <OnboardingScreen step={4} total={9} cta={{ label: tCommon("action.continue"), onPress: submit }}>
            <ScreenHeader Icon={RefreshCw} title={t("cycle.title")} lead={t("cycle.lead")} />

            <View style={styles.rows}>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>{t("cycle.periodLabel")}</Text>
                    <Stepper
                        value={periodLength}
                        min={1}
                        max={15}
                        unit={t("cycle.days")}
                        onChange={(value) => set({ periodLength: value })}
                        testID="onboarding-cycle-period"
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>{t("cycle.cycleLabel")}</Text>
                    <Stepper
                        value={cycleLength}
                        min={15}
                        max={90}
                        unit={t("cycle.days")}
                        onChange={(value) => set({ cycleLength: value })}
                        testID="onboarding-cycle-length"
                    />
                </View>
            </View>

            <View style={styles.note}>
                <Lightbulb size={18} color={theme.colors.link} strokeWidth={2.2} />
                <Text style={styles.noteText}>{t("cycle.help")}</Text>
            </View>
        </OnboardingScreen>
    );
}
