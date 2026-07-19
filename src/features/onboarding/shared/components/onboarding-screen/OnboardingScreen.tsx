import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/icon-button/IconButton";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { ChevronLeft } from "lucide-react-native";

import { StepDots } from "../step-dots/StepDots";
import { useOnboardingScreenStyles } from "./OnboardingScreenStyle";

export type OnboardingCta = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    Icon?: LucideIcon;
    testID?: string;
};

type Props = {
    /** Paso actual (1-based) y total, para los puntos tipo carrusel sobre el CTA. */
    step?: number;
    total?: number;
    accent?: string;
    cta?: OnboardingCta;
    secondaryCta?: OnboardingCta;
    footer?: ReactNode;
    center?: boolean;
    children: ReactNode;
};

/**
 * Lienzo común del onboarding. Mantiene gesto/botón del sistema y expone un
 * control visual de vuelta cuando hay historial, para evitar un callejón sin salida.
 */
export function OnboardingScreen({ step, total, accent, cta, secondaryCta, footer, center, children }: Props) {
    const { t } = useTranslation("common");
    const router = useRouter();
    const styles = useOnboardingScreenStyles();
    const showDots = typeof step === "number" && typeof total === "number" && total > 1;
    const showBack = router.canGoBack() && step !== 1 && step !== total;

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
            <View style={styles.topBar}>
                {showBack ? (
                    <IconButton
                        Icon={ChevronLeft}
                        accessibilityHint={t("accessibility.backHint")}
                        accessibilityLabel={t("action.back")}
                        onPress={router.back}
                    />
                ) : null}
            </View>

            <ScrollView
                contentContainerStyle={[styles.bodyContent, center && styles.bodyCenter]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>

            <View style={styles.footer}>
                {footer ?? (
                    <>
                        {showDots ? <StepDots count={total} index={step - 1} accent={accent} /> : null}
                        {cta ? (
                            <PrimaryButton
                                label={cta.label}
                                onPress={cta.onPress}
                                disabled={cta.disabled}
                                accent={accent}
                                Icon={cta.Icon}
                                testID={cta.testID ?? "onboarding-cta-primary"}
                            />
                        ) : null}
                        {secondaryCta ? (
                            <PrimaryButton
                                label={secondaryCta.label}
                                onPress={secondaryCta.onPress}
                                disabled={secondaryCta.disabled}
                                variant="secondary"
                                testID={secondaryCta.testID ?? "onboarding-cta-secondary"}
                            />
                        ) : null}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
