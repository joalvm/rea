import { Image, ScrollView, Text, View } from "react-native";

import brandHorizontal from "@assets/branding/logo-horizontal.png";
import { NotificationMoment } from "@/types/notifications.types";
import { AppSettings } from "@/types/settings.types";
import { SoftButton } from "@/ui/SoftButton";
import styles from "./OnboardingScreen.styles";
import OnboardingGoalStep from "./components/OnboardingGoalStep";
import OnboardingLastPeriodStep from "./components/OnboardingLastPeriodStep";
import OnboardingPrivacyStep from "./components/OnboardingPrivacyStep";
import OnboardingRegularityStep from "./components/OnboardingRegularityStep";
import OnboardingReminderStep from "./components/OnboardingReminderStep";
import OnboardingRhythmStep from "./components/OnboardingRhythmStep";
import useOnboardingFlow from "./hooks/useOnboardingFlow";

/** Props del flujo inicial de onboarding. */
interface OnboardingScreenProps {
    onComplete: (settings: AppSettings, moments: NotificationMoment[]) => Promise<void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const {
        step,
        setStep,
        goal,
        setGoal,
        lastPeriodStart,
        setLastPeriodStart,
        cycleLength,
        setCycleLength,
        periodLength,
        setPeriodLength,
        regularity,
        setRegularity,
        hormonalContraception,
        setHormonalContraception,
        moments,
        setMoments,
        saving,
        progress,
        finish,
    } = useOnboardingFlow({ onComplete });

    const steps = [
        <OnboardingPrivacyStep key="privacy" />,
        <OnboardingLastPeriodStep key="last-period" lastPeriodStart={lastPeriodStart} onChange={setLastPeriodStart} />,
        <OnboardingRhythmStep
            key="rhythm"
            cycleLength={cycleLength}
            onChangeCycleLength={setCycleLength}
            onChangePeriodLength={setPeriodLength}
            periodLength={periodLength}
        />,
        <OnboardingRegularityStep
            key="regularity"
            hormonalContraception={hormonalContraception}
            onChangeRegularity={setRegularity}
            onToggleHormonalContraception={() => setHormonalContraception((current) => !current)}
            regularity={regularity}
        />,
        <OnboardingGoalStep key="goal" goal={goal} onChangeGoal={setGoal} />,
        <OnboardingReminderStep
            key="reminders"
            moments={moments}
            onToggleMoment={(id) =>
                setMoments((current) =>
                    current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
                )
            }
        />,
    ];

    return (
        <View style={styles.screen}>
            <View style={styles.brand}>
                <Image resizeMode="contain" source={brandHorizontal} style={styles.brandImage} />
                <Text style={styles.brandText}>Privada, local y sin nube.</Text>
            </View>

            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {steps[step]}
            </ScrollView>

            <View style={styles.footer}>
                {step > 0 ? (
                    <SoftButton label="Atrás" onPress={() => setStep((current) => current - 1)} variant="ghost" />
                ) : null}
                <SoftButton
                    label={step === 5 ? "Empezar" : "Siguiente"}
                    loading={saving}
                    onPress={step === 5 ? finish : () => setStep((current) => current + 1)}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
}
