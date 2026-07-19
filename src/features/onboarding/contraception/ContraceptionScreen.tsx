import { ShieldCheck, TriangleAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

import { contraceptionMethodValues, isHormonalContraceptionMethod } from "@/db/enums/reproductiveMode";
import { useTheme } from "@/theme/useTheme";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";

import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { contraceptionSchema } from "./schemas/contraceptionSchema";
import { useContraceptionStyles } from "./ContraceptionStyle";

type Props = {
    onPush: (href: string) => void;
};

/**
 * Paso 7 (tracking_only y tracking_avoid_pregnancy): método anticonceptivo
 * declarado. TTC lo guarda como "none" sin preguntar (excluyente con hormonal);
 * embarazo no visita esta pantalla. "Prefiero no decirlo" es una opción de
 * primera clase, siempre visible, distinta de no responder.
 */
export default function ContraceptionScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const theme = useTheme();
    const styles = useContraceptionStyles();
    const method = useOnboardingStore((state) => state.draft.contraceptionMethod);
    const set = useOnboardingStore((state) => state.set);

    const submit = () => {
        const result = contraceptionSchema.safeParse({ contraceptionMethod: method });

        if (!result.success) {
            Alert.alert(tValidation("onboarding.invalidContraception"));
            return;
        }

        onPush("/(onboarding)/notifications");
    };

    return (
        <OnboardingScreen step={7} total={9} cta={{ label: tCommon("action.continue"), onPress: submit }}>
            <ScreenHeader Icon={ShieldCheck} title={t("contraception.title")} lead={t("contraception.lead")} />

            <Pressable
                onPress={() => set({ contraceptionMethod: null })}
                accessibilityRole="button"
                accessibilityState={{ selected: method === null }}
                accessibilityLabel={t("contraception.preferNotToSay")}
                style={[styles.preferNotToSay, method === null && styles.preferNotToSayOn]}
                testID="onboarding-contraception-prefer-not-to-say"
            >
                <Text style={[styles.preferNotToSayText, method === null && styles.preferNotToSayTextOn]}>
                    {t("contraception.preferNotToSay")}
                </Text>
            </Pressable>

            <View style={styles.grid}>
                {contraceptionMethodValues.map((value) => {
                    const selected = method === value;
                    return (
                        <Pressable
                            key={value}
                            onPress={() => set({ contraceptionMethod: value })}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            accessibilityLabel={t(`contraception.method.${value}`)}
                            style={[styles.chip, selected && styles.chipOn]}
                            testID={`onboarding-contraception-method-${value}`}
                        >
                            <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                                {t(`contraception.method.${value}`)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {isHormonalContraceptionMethod(method) ? (
                <View style={styles.warningBox}>
                    <TriangleAlert size={18} color={theme.colors.warningText} strokeWidth={2.2} />
                    <Text style={styles.warningText}>{t("contraception.warning")}</Text>
                </View>
            ) : null}
        </OnboardingScreen>
    );
}
