import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { addDays, formatShortDate, toIsoDate } from "../../modules/cycle/shared/cycleDate.utils";
import { colors } from "../../theme";
import { NumberPicker } from "../../ui/NumberPicker";
import { SoftButton } from "../../ui/SoftButton";
import { StepShell } from "../../ui/StepShell";
import styles from "./OnboardingScreen.styles";
import { GOALS, REGULARITY } from "./constants/onboardingOptions";
import { OnboardingScreenProps } from "./onboarding.types";
import useOnboardingFlow from "./hooks/useOnboardingFlow";

const brandHorizontal = require("../../../assets/branding/logo-horizontal.png");

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
                {step === 0 ? (
                    <StepShell
                        icon="shield-check-outline"
                        subtitle="Datos en tu teléfono. Sin cuenta, sin nube, sin contenido invasivo."
                        title="Tu ciclo, en privado."
                    >
                        <Text style={styles.body}>Vamos a separar lo que registras de lo que solo se estima.</Text>
                    </StepShell>
                ) : null}

                {step === 1 ? (
                    <StepShell
                        icon="calendar-start"
                        subtitle="Usaremos esta fecha para calcular el día de ciclo inicial."
                        title="¿Cuándo empezó tu última regla?"
                    >
                        <View style={styles.dateOptions}>
                            {[0, 1, 2, 3, 5, 7, 14].map((daysAgo) => {
                                const iso = addDays(toIsoDate(new Date()), -daysAgo);
                                return (
                                    <Pressable
                                        key={daysAgo}
                                        onPress={() => setLastPeriodStart(iso)}
                                        style={[styles.option, lastPeriodStart === iso && styles.optionActive]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                lastPeriodStart === iso && styles.optionTextActive,
                                            ]}
                                        >
                                            {daysAgo === 0 ? "Hoy" : `Hace ${daysAgo} días`}
                                        </Text>
                                        <Text style={styles.optionMeta}>{formatShortDate(iso)}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </StepShell>
                ) : null}

                {step === 2 ? (
                    <StepShell
                        icon="tune-variant"
                        subtitle="Puedes corregirlo luego cuando tengas más registros."
                        title="Tu ritmo aproximado"
                    >
                        <NumberPicker
                            label="Duración del ciclo"
                            onChange={setCycleLength}
                            suffix="días"
                            value={cycleLength}
                        />
                        <NumberPicker
                            label="Duración del sangrado"
                            max={10}
                            min={2}
                            onChange={setPeriodLength}
                            suffix="días"
                            value={periodLength}
                        />
                    </StepShell>
                ) : null}

                {step === 3 ? (
                    <StepShell
                        icon="chart-timeline-variant"
                        subtitle="Esto cambia el nivel de confianza de las predicciones."
                        title="¿Qué tan regular suele ser?"
                    >
                        <View style={styles.segmentGroup}>
                            {REGULARITY.map((item) => (
                                <Pressable
                                    key={item.key}
                                    onPress={() => setRegularity(item.key)}
                                    style={[styles.segment, regularity === item.key && styles.segmentActive]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            regularity === item.key && styles.segmentTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                        <Pressable
                            onPress={() => setHormonalContraception((current) => !current)}
                            style={[styles.toggleRow, hormonalContraception && styles.toggleRowActive]}
                        >
                            <Text style={styles.toggleText}>Uso anticonceptivos hormonales</Text>
                            <MaterialCommunityIcons
                                color={hormonalContraception ? colors.primaryDeep : colors.muted}
                                name={hormonalContraception ? "check-circle" : "circle-outline"}
                                size={24}
                            />
                        </Pressable>
                    </StepShell>
                ) : null}

                {step === 4 ? (
                    <StepShell
                        icon="star-four-points-outline"
                        subtitle="Esto no diagnostica ni promete precisión."
                        title="¿Qué quieres priorizar?"
                    >
                        <View style={styles.goals}>
                            {GOALS.map((item) => (
                                <Pressable
                                    key={item.key}
                                    onPress={() => setGoal(item.key)}
                                    style={[styles.goal, goal === item.key && styles.goalActive]}
                                >
                                    <MaterialCommunityIcons
                                        color={colors.primaryDeep}
                                        name={item.icon as never}
                                        size={26}
                                    />
                                    <View style={styles.goalText}>
                                        <Text style={styles.goalTitle}>{item.label}</Text>
                                        <Text style={styles.goalDescription}>{item.description}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </StepShell>
                ) : null}

                {step === 5 ? (
                    <StepShell
                        icon="bell-outline"
                        subtitle="Podrás cambiarlo en Ajustes. Nada sensible aparece en la notificación."
                        title="Preguntas suaves"
                    >
                        <View style={styles.reminders}>
                            {moments.map((moment) => (
                                <Pressable
                                    key={moment.id}
                                    onPress={() =>
                                        setMoments((current) =>
                                            current.map((item) =>
                                                item.id === moment.id ? { ...item, enabled: !item.enabled } : item,
                                            ),
                                        )
                                    }
                                    style={[styles.reminder, moment.enabled && styles.reminderActive]}
                                >
                                    <View>
                                        <Text style={styles.reminderTitle}>{moment.label}</Text>
                                        <Text style={styles.reminderMeta}>{moment.time}</Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        color={moment.enabled ? colors.primaryDeep : colors.muted}
                                        name={moment.enabled ? "toggle-switch" : "toggle-switch-off-outline"}
                                        size={32}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </StepShell>
                ) : null}
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
