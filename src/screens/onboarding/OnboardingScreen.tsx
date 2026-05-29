import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { addDays, formatShortDate, toIsoDate } from "../../modules/cycle/shared/cycleDate.utils";
import createDefaultNotificationMoments from "../../modules/notifications/defaults/createDefaultNotificationMoments";
import { colors, radii, type } from "../../theme";
import { Goal, Regularity } from "../../types/settings.types";
import { NumberPicker } from "../../ui/NumberPicker";
import { SoftButton } from "../../ui/SoftButton";
import { StepShell } from "../../ui/StepShell";
import { GOALS, REGULARITY } from "./constants/onboardingOptions";
import { OnboardingScreenProps } from "./onboarding.types";

const brandHorizontal = require("../../../assets/branding/logo-horizontal.png");

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState(0);
    const [goal, setGoal] = useState<Goal>("self_knowledge");
    const [lastPeriodStart, setLastPeriodStart] = useState(toIsoDate(new Date()));
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [regularity, setRegularity] = useState<Regularity>("regular");
    const [hormonalContraception, setHormonalContraception] = useState(false);
    const [moments, setMoments] = useState(createDefaultNotificationMoments());
    const [saving, setSaving] = useState(false);

    const progress = useMemo(() => (step + 1) / 6, [step]);

    const finish = async () => {
        const now = new Date().toISOString();
        setSaving(true);
        try {
            await onComplete(
                {
                    onboarded: true,
                    lastPeriodStart,
                    cycleLength,
                    periodLength,
                    regularity,
                    hormonalContraception,
                    goal,
                    createdAt: now,
                },
                moments,
            );
        } finally {
            setSaving(false);
        }
    };

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

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 42,
    },
    brand: {
        alignItems: "center",
        gap: 10,
    },
    brandImage: {
        width: 176,
        height: 58,
    },
    brandText: {
        color: colors.muted,
        fontSize: type.body,
        fontWeight: "700",
    },
    progressTrack: {
        height: 5,
        marginHorizontal: 34,
        marginTop: 24,
        borderRadius: 999,
        backgroundColor: colors.surfaceSoft,
    },
    progressFill: {
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.primaryDeep,
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
    },
    body: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 23,
        textAlign: "center",
    },
    dateOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    option: {
        width: "47%",
        borderRadius: radii.lg,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    optionActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    optionTextActive: {
        color: colors.primaryInk,
    },
    optionMeta: {
        color: colors.muted,
        marginTop: 6,
        fontSize: type.small,
        fontWeight: "700",
    },
    segmentGroup: {
        flexDirection: "row",
        gap: 8,
    },
    segment: {
        flex: 1,
        minHeight: 48,
        borderRadius: radii.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    segmentActive: {
        backgroundColor: colors.primary,
    },
    segmentText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    segmentTextActive: {
        color: colors.primaryInk,
    },
    toggleRow: {
        minHeight: 58,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toggleRowActive: {
        backgroundColor: colors.primarySoft,
    },
    toggleText: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    goals: {
        gap: 10,
    },
    goal: {
        flexDirection: "row",
        gap: 14,
        alignItems: "center",
        borderRadius: radii.lg,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    goalActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    goalText: {
        flex: 1,
    },
    goalTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    goalDescription: {
        color: colors.muted,
        fontSize: type.small,
        marginTop: 3,
    },
    reminders: {
        gap: 10,
    },
    reminder: {
        minHeight: 72,
        borderRadius: radii.lg,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reminderActive: {
        backgroundColor: colors.primarySoft,
    },
    reminderTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    reminderMeta: {
        color: colors.muted,
        marginTop: 3,
        fontWeight: "700",
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 26,
        gap: 10,
    },
    nextButton: {
        width: "100%",
    },
});
