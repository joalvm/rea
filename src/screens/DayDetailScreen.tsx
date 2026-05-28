import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SoftButton } from "../components/SoftButton";
import { SoftCard } from "../components/SoftCard";
import { estimateCycle, parseIsoDate, toIsoDate } from "../cycle";
import { colors, type } from "../theme";
import { AppSettings, Cycle, DailyLog, MoodCheckIn, PhaseKey } from "../types";

interface DayDetailScreenProps {
    selectedIso: string;
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onBack: () => void;
    onOpenDiary: () => void;
}

export function DayDetailScreen({
    selectedIso,
    settings,
    cycles,
    dailyLogs,
    moodCheckIns,
    onBack,
    onOpenDiary,
}: DayDetailScreenProps) {
    const snapshot = estimateCycle(settings, cycles, dailyLogs, selectedIso);
    const todayIso = toIsoDate(new Date());
    const isFuture = selectedIso > todayIso;
    const dailyLog = dailyLogs.find((entry) => entry.date === selectedIso) ?? null;
    const moments = moodCheckIns
        .filter((entry) => toIsoDate(new Date(entry.datetime)) === selectedIso)
        .sort((left, right) => right.datetime.localeCompare(left.datetime));
    const detailItems = dailyLog ? buildDailyLogDetails(dailyLog) : [];
    const careTips = getCareTips(snapshot.phase);
    const summary = buildDaySummary(selectedIso, todayIso, snapshot.phaseMessage, dailyLog, moments);
    const hasRecords = Boolean(dailyLog || moments.length > 0);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
                <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="arrow-left" size={20} />
                </Pressable>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Detalle del día</Text>
                    <Text style={styles.title}>{formatLongDate(selectedIso)}</Text>
                    <Text style={styles.subtitle}>
                        {snapshot.phaseLabel} · {snapshot.sourceLabel}
                    </Text>
                </View>
            </View>

            <SoftCard style={styles.summaryCard}>
                <Text style={styles.cardTitle}>Lectura rápida</Text>
                <Text style={styles.summaryText}>{summary}</Text>
                <View style={styles.badges}>
                    <Text style={styles.badge}>{snapshot.fertilityStatusLabel}</Text>
                    <Text style={styles.badge}>Confianza {snapshot.confidenceLabel.toLowerCase()}</Text>
                    {dailyLog?.bleedingLevel && dailyLog.bleedingLevel !== "none" ? (
                        <Text style={styles.badge}>{bleedingLabel(dailyLog.bleedingLevel)}</Text>
                    ) : null}
                </View>
            </SoftCard>

            <SoftCard style={styles.card}>
                <Text style={styles.cardTitle}>{isFuture ? "Referencia orientativa" : "Qué mirar aquí"}</Text>
                <Text style={styles.cardBody}>{snapshot.phaseMessage}</Text>
                {careTips.map((tip) => (
                    <View key={tip.text} style={styles.tipRow}>
                        <View style={[styles.tipIcon, { backgroundColor: tip.background }]}>
                            <MaterialCommunityIcons color={tip.color} name={tip.icon as never} size={18} />
                        </View>
                        <Text style={styles.tipText}>{tip.text}</Text>
                    </View>
                ))}
            </SoftCard>

            {dailyLog ? (
                <SoftCard style={styles.card}>
                    <Text style={styles.cardTitle}>Registro del día</Text>
                    <Text style={styles.metaLine}>
                        {sourceLabel(dailyLog.source)} · {bleedingLabel(dailyLog.bleedingLevel)}
                    </Text>
                    {dailyLog.symptoms.length > 0 ? (
                        <View style={styles.chips}>
                            {dailyLog.symptoms.map((symptom) => (
                                <Text key={symptom} style={styles.chip}>
                                    {symptom}
                                </Text>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.softText}>Sin síntomas marcados.</Text>
                    )}
                    {detailItems.length > 0 ? (
                        <View style={styles.chips}>
                            {detailItems.map((detail) => (
                                <Text key={detail} style={styles.detailChip}>
                                    {detail}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                    {dailyLog.notes ? <Text style={styles.note}>{dailyLog.notes}</Text> : null}
                </SoftCard>
            ) : null}

            {moments.length > 0 ? (
                <SoftCard style={styles.card}>
                    <Text style={styles.cardTitle}>Momentos anotados</Text>
                    {moments.map((entry) => (
                        <View key={entry.id ?? entry.datetime} style={styles.momentRow}>
                            <View style={styles.momentCopy}>
                                <Text style={styles.momentTitle}>{momentLabel(entry.momentType)}</Text>
                                <Text style={styles.metaLine}>
                                    {new Date(entry.datetime).toLocaleTimeString("es-PE", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </View>
                            <View style={styles.momentMetrics}>
                                <Text style={styles.metric}>Ánimo {entry.mood}/5</Text>
                                <Text style={styles.metric}>Dolor {entry.pain}/5</Text>
                                <Text style={styles.metric}>Pecho {entry.breastSensitivity}/5</Text>
                            </View>
                            {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
                        </View>
                    ))}
                </SoftCard>
            ) : null}

            {!hasRecords && !isFuture ? (
                <SoftCard style={styles.card}>
                    <Text style={styles.cardTitle}>Sin anotaciones</Text>
                    <Text style={styles.cardBody}>
                        Ese día quedó vacío. Si hace falta corregirlo o completar algo, Diario sigue siendo punto de
                        edición.
                    </Text>
                </SoftCard>
            ) : null}

            {hasRecords || selectedIso <= todayIso ? (
                <SoftButton
                    label="Abrir diario"
                    onPress={onOpenDiary}
                    style={styles.actionButton}
                    variant="secondary"
                />
            ) : null}
        </ScrollView>
    );
}

function buildDaySummary(
    selectedIso: string,
    todayIso: string,
    phaseMessage: string,
    dailyLog: DailyLog | null,
    moments: MoodCheckIn[],
) {
    if (dailyLog) {
        const symptomCopy =
            dailyLog.symptoms.length > 0
                ? `Síntomas marcados: ${dailyLog.symptoms.slice(0, 3).join(", ")}.`
                : "Sin síntomas marcados.";
        const noteCopy = dailyLog.notes ? ` Nota: ${dailyLog.notes}` : "";
        return `Día observado. ${symptomCopy}${noteCopy}`.trim();
    }

    if (moments.length > 0) {
        const latest = moments[0];
        if (!latest) {
            return "Hay momentos guardados para este día.";
        }

        return `Hay ${moments.length} ${moments.length === 1 ? "momento" : "momentos"} guardados. Último ánimo ${latest.mood}/5 y dolor ${latest.pain}/5.`;
    }

    if (selectedIso > todayIso) {
        return `Aún no hay anotación. Vista usa referencia estimada: ${phaseMessage}`;
    }

    if (selectedIso === todayIso) {
        return "Hoy todavía no tiene registro completo. Esta vista sirve como contexto antes de anotar.";
    }

    return "No quedó registro ese día.";
}

function buildDailyLogDetails(log: DailyLog) {
    const items: string[] = [];

    if (log.details?.periodStarted) items.push("Empezó hoy");
    if (log.details?.periodEnded) items.push("Terminó hoy");
    if (log.details?.pmsStarted) items.push("Empezó SPM");

    if (log.details?.painImpact === "noticeable") items.push("Dolor se notó");
    if (log.details?.painImpact === "limits_day") items.push("Dolor me limitó");
    if (log.details?.painImpact === "stops_day") items.push("Dolor me tumbó");

    if ((log.details?.breastSensitivity ?? 0) > 0) {
        items.push(`Sensibilidad mamaria ${log.details?.breastSensitivity}/5`);
    }

    if (log.details?.medicationName) {
        items.push(log.details.medicationName);
    }

    if (log.details?.medicationRelief === "helped") items.push("Sí ayudó");
    if (log.details?.medicationRelief === "partly_helped") items.push("Ayudó poco");
    if (log.details?.medicationRelief === "did_not_help") items.push("No ayudó");

    if (log.details?.clotSize === "small") items.push("Coágulos leves");
    if (log.details?.clotSize === "medium") items.push("Coágulos medios");
    if (log.details?.clotSize === "large") items.push("Coágulos grandes");

    return items;
}

function bleedingLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "none") return "Sin sangrado";
    if (level === "spotting") return "Manchado";
    if (level === "light") return "Flujo leve";
    if (level === "medium") return "Flujo medio";
    return "Flujo abundante";
}

function sourceLabel(source: DailyLog["source"]) {
    if (source === "estimated") return "Estimado";
    if (source === "unknown") return "Sin datos";
    return "Observado";
}

function momentLabel(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "Cómo despertaste";
    if (momentType === "night") return "Cómo estuvo tu día";
    return "Cómo te sientes ahora";
}

function formatLongDate(iso: string) {
    const date = parseIsoDate(iso);
    const label = date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function getCareTips(phase: PhaseKey) {
    if (phase === "menstrual") {
        return [
            {
                icon: "tea-outline",
                text: "Calor suave, agua cerca y descanso sin culpa.",
                color: colors.period,
                background: colors.periodSoft,
            },
            {
                icon: "pulse",
                text: "Si dolor cambia, conviene dejarlo anotado para comparar luego.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "follicular") {
        return [
            {
                icon: "walk",
                text: "Si energía acompaña, algo de movimiento suave suele sentar bien.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "notebook-heart-outline",
                text: "Sueño y ánimo aquí suelen dar contexto útil para resto de ciclo.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "fertile") {
        return [
            {
                icon: "leaf",
                text: "Ventana sigue siendo orientativa; señales reales valen más que calendario.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "thermometer-lines",
                text: "Si buscas más precisión, temperatura o tests ayudan más.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    return [
        {
            icon: "weather-night",
            text: "Prioriza sueño, comida tranquila y pausas pequeñas.",
            color: "#7A5EC9",
            background: colors.lutealSoft,
        },
        {
            icon: "heart-outline",
            text: "Ánimo y estrés aquí suelen merecer seguimiento suave, sin juicio.",
            color: colors.period,
            background: colors.periodSoft,
        },
    ];
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 58,
        paddingHorizontal: 18,
        paddingBottom: 36,
        gap: 18,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    headerCopy: {
        flex: 1,
        gap: 6,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    title: {
        color: colors.ink,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "900",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 20,
    },
    summaryCard: {
        gap: 12,
        backgroundColor: colors.surfaceSoft,
    },
    card: {
        gap: 12,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    summaryText: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    cardBody: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    badge: {
        color: colors.primaryDeep,
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.tiny,
        fontWeight: "900",
        overflow: "hidden",
    },
    metaLine: {
        color: colors.muted,
        fontSize: type.small,
        lineHeight: 18,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        color: colors.ink,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.small,
        overflow: "hidden",
    },
    detailChip: {
        color: colors.primaryDeep,
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: type.small,
        fontWeight: "800",
        overflow: "hidden",
    },
    softText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 20,
    },
    note: {
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 21,
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    tipIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    tipText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 20,
    },
    momentRow: {
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    momentCopy: {
        gap: 4,
    },
    momentTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    momentMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metric: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "700",
    },
    actionButton: {
        marginTop: 4,
    },
});
