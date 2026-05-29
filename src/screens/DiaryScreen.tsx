import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { formatShortDate } from "../modules/cycle/shared/cycleDate.utils";
import { colors, radii, type } from "../theme";
import { DailyLog, MoodCheckIn } from "../types/records.types";
import { SoftButton } from "../ui/SoftButton";
import { SoftCard } from "../ui/SoftCard";

interface DiaryScreenProps {
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onOpenCheckIn: () => void;
    onOpenQuickCheckIn: () => void;
    onEditCheckIn: (entry: MoodCheckIn) => void;
    onEditDailyLog: (entry: DailyLog) => void;
}

export function DiaryScreen({
    dailyLogs,
    moodCheckIns,
    onOpenCheckIn,
    onOpenQuickCheckIn,
    onEditCheckIn,
    onEditDailyLog,
}: DiaryScreenProps) {
    const latest = moodCheckIns.slice(0, 12);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.kicker}>Diario privado</Text>
                <Text style={styles.title}>Tus registros, sin ruido.</Text>
                <Text style={styles.subtitle}>
                    Mañana, noche y momentos sueltos se guardan separados para que tengan sentido después.
                </Text>
            </View>

            <View style={styles.actions}>
                <SoftButton label="Mi día" onPress={onOpenCheckIn} style={styles.actionButton} />
                <SoftButton
                    label="Ahora"
                    onPress={onOpenQuickCheckIn}
                    style={styles.actionButton}
                    variant="secondary"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Últimos momentos</Text>
                {latest.length === 0 ? (
                    <EmptyState />
                ) : (
                    latest.map((item) => (
                        <CheckInRow item={item} key={item.id ?? item.datetime} onEdit={() => onEditCheckIn(item)} />
                    ))
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Días con registro completo</Text>
                {dailyLogs.length === 0 ? (
                    <EmptyState label="Aún no hay días completos. El primero tarda menos de un minuto." />
                ) : (
                    dailyLogs.map((log) => <DailyLogRow key={log.date} log={log} onEdit={() => onEditDailyLog(log)} />)
                )}
            </View>
        </ScrollView>
    );
}

function CheckInRow({ item, onEdit }: { item: MoodCheckIn; onEdit: () => void }) {
    const date = new Date(item.datetime);
    return (
        <SoftCard style={styles.rowCard}>
            <View style={styles.rowIcon}>
                <MaterialCommunityIcons color={colors.primaryDeep} name={momentIcon(item.momentType)} size={22} />
            </View>
            <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                    <View style={styles.rowCopy}>
                        <Text style={styles.rowTitle}>{momentLabel(item.momentType)}</Text>
                        <Text style={styles.rowMeta}>
                            {date.toLocaleDateString("es-PE", { day: "numeric", month: "short" })} ·{" "}
                            {date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                    </View>
                    <Pressable accessibilityRole="button" onPress={onEdit} style={styles.editButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="pencil-outline" size={18} />
                    </Pressable>
                </View>
                <View style={styles.metrics}>
                    <Metric label="Ánimo" value={item.mood} />
                    <Metric label="Energía" value={item.energy} />
                    <Metric label="Dolor" value={item.pain} />
                    <Metric label="Pecho" value={item.breastSensitivity} />
                    <Metric label="Estrés" value={item.stress} />
                </View>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
        </SoftCard>
    );
}

function DailyLogRow({ log, onEdit }: { log: DailyLog; onEdit: () => void }) {
    const details = buildDailyLogDetails(log);

    return (
        <SoftCard style={styles.dailyCard}>
            <View style={styles.dailyHeader}>
                <Text style={styles.rowTitle}>{formatShortDate(log.date)}</Text>
                <View style={styles.dailyHeaderRight}>
                    <Pressable accessibilityRole="button" onPress={onEdit} style={styles.editButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="pencil-outline" size={18} />
                    </Pressable>
                    <View style={styles.dailyMetaGroup}>
                        <Text style={styles.sourcePill}>{sourceLabel(log.source)}</Text>
                        <Text style={styles.bleeding}>{bleedingLabel(log.bleedingLevel)}</Text>
                    </View>
                </View>
            </View>
            {log.symptoms.length > 0 ? (
                <View style={styles.symptoms}>
                    {log.symptoms.map((symptom) => (
                        <Text key={symptom} style={styles.symptom}>
                            {symptom}
                        </Text>
                    ))}
                </View>
            ) : (
                <Text style={styles.rowMeta}>Sin síntomas marcados.</Text>
            )}
            {details.length > 0 ? (
                <View style={styles.symptoms}>
                    {details.map((detail) => (
                        <Text key={detail} style={styles.detailChip}>
                            {detail}
                        </Text>
                    ))}
                </View>
            ) : null}
            {log.notes ? <Text style={styles.note}>{log.notes}</Text> : null}
        </SoftCard>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.metric}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}/5</Text>
        </View>
    );
}

function EmptyState({
    label = "Aún no hay datos. Iremos mostrando patrones cuando haya historial suficiente.",
}: {
    label?: string;
}) {
    return (
        <SoftCard style={styles.empty}>
            <MaterialCommunityIcons color={colors.primaryDeep} name="notebook-outline" size={28} />
            <Text style={styles.emptyText}>{label}</Text>
        </SoftCard>
    );
}

function momentIcon(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "weather-sunset-up";
    if (momentType === "night") return "weather-night";
    return "clock-outline";
}

function momentLabel(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "Cómo despertaste";
    if (momentType === "night") return "Cómo estuvo tu día";
    return "Cómo te sientes ahora";
}

function bleedingLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "none") return "Sin sangrado";
    if (level === "spotting") return "Manchado";
    if (level === "light") return "Leve";
    if (level === "medium") return "Medio";
    return "Abundante";
}

function sourceLabel(source: DailyLog["source"]) {
    if (source === "estimated") return "Estimado";
    if (source === "unknown") return "Sin datos";
    return "Observado";
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

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 58,
        paddingHorizontal: 18,
        paddingBottom: 32,
        gap: 22,
    },
    header: {
        gap: 8,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    title: {
        color: colors.ink,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "900",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingHorizontal: 10,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    rowCard: {
        flexDirection: "row",
        gap: 14,
    },
    rowIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    rowBody: {
        flex: 1,
        gap: 8,
    },
    rowHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    rowCopy: {
        flex: 1,
        gap: 4,
    },
    rowTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    rowMeta: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "700",
    },
    metrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metric: {
        backgroundColor: colors.surfaceSoft,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    metricLabel: {
        color: colors.muted,
        fontSize: type.tiny,
        fontWeight: "900",
    },
    metricValue: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
        marginTop: 2,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    note: {
        color: colors.ink,
        fontSize: type.small,
        lineHeight: 18,
    },
    dailyCard: {
        gap: 12,
    },
    dailyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    dailyHeaderRight: {
        alignItems: "flex-end",
        gap: 8,
    },
    dailyMetaGroup: {
        alignItems: "flex-end",
        gap: 6,
    },
    sourcePill: {
        color: colors.primaryDeep,
        backgroundColor: colors.primarySoft,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: type.tiny,
        fontWeight: "900",
        overflow: "hidden",
    },
    bleeding: {
        color: colors.period,
        fontSize: type.small,
        fontWeight: "900",
    },
    symptoms: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    symptom: {
        color: colors.primaryInk,
        backgroundColor: colors.primarySoft,
        borderRadius: radii.md,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: type.small,
        fontWeight: "800",
    },
    detailChip: {
        color: colors.ink,
        backgroundColor: colors.surfaceSoft,
        borderRadius: radii.md,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: type.small,
        fontWeight: "700",
    },
    empty: {
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.primarySoft,
    },
    emptyText: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 22,
        textAlign: "center",
        fontWeight: "700",
    },
});
