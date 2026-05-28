import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { IconButton } from "../components/IconButton";
import { QuickActionCard } from "../components/QuickActionCard";
import { SoftButton } from "../components/SoftButton";
import { SoftCard } from "../components/SoftCard";
import { WeekStrip } from "../components/WeekStrip";
import { buildEducationalAlerts, buildPatternInsights } from "../cycle";
import { colors, radii, type } from "../theme";
import { AppSettings, Cycle, CycleSnapshot, DailyLog, EducationalAlert, MoodCheckIn, PhaseKey } from "../types";

const brandMark = require("../../assets/branding/logo-mark.png");

interface TodayScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    snapshot: CycleSnapshot;
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
    onOpenCheckIn: () => void;
    onOpenQuickCheckIn: () => void;
    onOpenCalendar: () => void;
    onOpenPatterns: () => void;
    onOpenSettings: () => void;
}

export function TodayScreen({
    settings,
    cycles,
    snapshot,
    moodCheckIns,
    dailyLogs,
    onOpenCheckIn,
    onOpenQuickCheckIn,
    onOpenCalendar,
    onOpenPatterns,
    onOpenSettings,
}: TodayScreenProps) {
    const insights = buildPatternInsights(settings, cycles, dailyLogs, moodCheckIns);
    const alerts = buildEducationalAlerts(settings, cycles, dailyLogs, moodCheckIns).slice(0, 2);
    const careTips = getCareTips(snapshot.phase);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
                <View style={styles.topRow}>
                    <View style={styles.brandLockup}>
                        <View style={styles.logo}>
                            <Image resizeMode="contain" source={brandMark} style={styles.logoImage} />
                        </View>
                        <View style={styles.brandCopy}>
                            <Text style={styles.brandName}>Rea</Text>
                            <Text style={styles.date}>
                                {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
                            </Text>
                        </View>
                    </View>
                    <IconButton icon="cog-outline" label="Abrir ajustes" onPress={onOpenSettings} />
                </View>

                <Text style={styles.heroEyebrow}>Lectura de hoy</Text>
                <Text style={styles.phaseDay}>Día {snapshot.cycleDay}</Text>
                <Text style={styles.phaseLabel}>{snapshot.phaseLabel}</Text>
                <Text style={styles.phaseMessage}>{snapshot.phaseMessage}</Text>

                <View style={styles.phaseMetaRow}>
                    <MetaPill label={snapshot.sourceLabel} tone={snapshot.source} />
                    <MetaPill label={snapshot.confidenceLabel} tone="confidence" />
                </View>
                <Text style={styles.phaseSupport}>{snapshot.confidenceNote}</Text>

                <SoftCard style={styles.weekCard}>
                    <WeekStrip week={snapshot.week} />
                </SoftCard>

                <View style={styles.heroStats}>
                    <MiniStat icon="calendar-clock" label="Próxima regla" value={snapshot.nextPeriodLabel} />
                    <View style={styles.statDivider} />
                    <MiniStat
                        icon="leaf"
                        label={snapshot.fertilityVisible ? "Ventana fértil" : "Fertilidad"}
                        value={snapshot.fertilityStatusLabel}
                    />
                </View>

                <SoftButton label="Registrar mi día" onPress={onOpenCheckIn} style={styles.heroButton} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acciones rápidas</Text>
                <ScrollView horizontal contentContainerStyle={styles.quickCards} showsHorizontalScrollIndicator={false}>
                    <QuickActionCard
                        hint="ahora"
                        icon="heart-pulse"
                        onPress={onOpenQuickCheckIn}
                        title="Me siento"
                        tone="primary"
                    />
                    <QuickActionCard
                        hint="flujo"
                        icon="water-plus-outline"
                        onPress={onOpenCheckIn}
                        title="Mi día"
                        tone="period"
                    />
                    <QuickActionCard
                        hint="mes"
                        icon="calendar-month-outline"
                        onPress={onOpenCalendar}
                        title="Calendario"
                        tone="fertile"
                    />
                    <QuickActionCard
                        hint="señales"
                        icon="chart-bell-curve-cumulative"
                        onPress={onOpenPatterns}
                        title="Patrones"
                        tone="luteal"
                    />
                </ScrollView>
            </View>

            {alerts.length > 0 ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Señales para mirar</Text>
                    <SoftCard style={styles.alertCard}>
                        {alerts.map((alert) => (
                            <View key={alert.id} style={styles.alertRow}>
                                <View
                                    style={[
                                        styles.alertBadge,
                                        { backgroundColor: getAlertTone(alert.severity).background },
                                    ]}
                                >
                                    <Text style={[styles.alertBadgeText, { color: getAlertTone(alert.severity).ink }]}>
                                        {getAlertTone(alert.severity).label}
                                    </Text>
                                </View>
                                <View style={styles.alertCopy}>
                                    <Text style={styles.alertTitle}>{alert.title}</Text>
                                    <Text style={styles.alertText}>{alert.detail}</Text>
                                </View>
                            </View>
                        ))}
                    </SoftCard>
                </View>
            ) : null}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Para cuidarte hoy</Text>
                <SoftCard style={styles.careCard}>
                    {careTips.map((tip) => (
                        <View key={tip.text} style={styles.careRow}>
                            <View style={[styles.careIcon, { backgroundColor: tip.background }]}>
                                <MaterialCommunityIcons color={tip.color} name={tip.icon as never} size={21} />
                            </View>
                            <Text style={styles.careText}>{tip.text}</Text>
                        </View>
                    ))}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lo que vamos notando</Text>
                <SoftCard style={styles.insightCard}>
                    {insights.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Con algunos registros más, esta zona podrá comparar fases y repeticiones reales.
                        </Text>
                    ) : (
                        insights.map((insight) => (
                            <View key={insight.id} style={styles.insightRow}>
                                <View style={[styles.insightDot, insight.tone === "watch" && styles.insightDotWatch]}>
                                    <MaterialCommunityIcons
                                        color={insight.tone === "watch" ? colors.period : colors.primaryDeep}
                                        name={
                                            insight.tone === "watch" ? "bell-alert-outline" : "star-four-points-outline"
                                        }
                                        size={16}
                                    />
                                </View>
                                <View style={styles.insightCopy}>
                                    <Text style={styles.insightTitle}>{insight.title}</Text>
                                    <Text style={styles.insightText}>{insight.detail}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </SoftCard>
            </View>
        </ScrollView>
    );
}

function getAlertTone(severity: EducationalAlert["severity"]) {
    if (severity === "consult") {
        return { label: "Consultar", background: colors.periodSoft, ink: colors.period };
    }

    if (severity === "watch") {
        return { label: "Vigilar", background: colors.primarySoft, ink: colors.primaryDeep };
    }

    return { label: "Info", background: colors.surfaceSoft, ink: colors.muted };
}

function MetaPill({ label, tone }: { label: string; tone: CycleSnapshot["source"] | "confidence" }) {
    const backgroundColor =
        tone === "observed"
            ? colors.periodSoft
            : tone === "estimated"
              ? colors.primarySoft
              : tone === "confidence"
                ? colors.surface
                : colors.surfaceSoft;
    const textColor =
        tone === "observed"
            ? colors.period
            : tone === "estimated"
              ? colors.primaryDeep
              : tone === "confidence"
                ? colors.ink
                : colors.muted;

    return (
        <View style={[styles.metaPill, { backgroundColor }]}>
            <Text style={[styles.metaPillText, { color: textColor }]}>{label}</Text>
        </View>
    );
}

function MiniStat({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.miniStat}>
            <MaterialCommunityIcons color={colors.primaryDeep} name={icon as never} size={18} />
            <View style={styles.miniStatCopy}>
                <Text style={styles.miniStatLabel}>{label}</Text>
                <Text numberOfLines={1} style={styles.miniStatValue}>
                    {value}
                </Text>
            </View>
        </View>
    );
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
                text: "Si el dolor cambia, déjalo marcado para compararlo luego.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "follicular") {
        return [
            {
                icon: "walk",
                text: "Si tienes energía, muévete un poco sin exigirte.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "notebook-heart-outline",
                text: "Anota sueño y ánimo; suelen dar pistas útiles.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "fertile") {
        return [
            {
                icon: "leaf",
                text: "La ventana es aproximada; mira también tus señales reales.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "thermometer-lines",
                text: "Si buscas precisión, temperatura o tests ayudan más.",
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
            text: "Observa ánimo y estrés sin juzgarte.",
            color: colors.period,
            background: colors.periodSoft,
        },
    ];
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 26,
        paddingBottom: 32,
        backgroundColor: colors.background,
    },
    hero: {
        marginHorizontal: 20,
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.surface,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    brandLockup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },
    logoImage: {
        width: 28,
        height: 28,
    },
    brandCopy: {
        gap: 2,
    },
    brandName: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    date: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    heroEyebrow: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    phaseMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 2,
    },
    metaPill: {
        minHeight: 28,
        borderRadius: 14,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.line,
    },
    metaPillText: {
        fontSize: type.small,
        fontWeight: "900",
    },
    phaseLabel: {
        color: colors.ink,
        fontSize: type.title,
        fontWeight: "800",
    },
    phaseDay: {
        color: colors.ink,
        fontSize: 46,
        lineHeight: 50,
        fontWeight: "900",
    },
    phaseMessage: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 22,
        maxWidth: 320,
    },
    phaseSupport: {
        color: colors.muted,
        fontSize: type.small,
        lineHeight: 18,
        maxWidth: 320,
    },
    weekCard: {
        paddingVertical: 14,
    },
    heroStats: {
        minHeight: 64,
        borderRadius: radii.lg,
        backgroundColor: colors.surfaceSoft,
        borderWidth: 1,
        borderColor: colors.line,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
    },
    miniStat: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    miniStatCopy: {
        flex: 1,
        minWidth: 0,
    },
    miniStatLabel: {
        color: colors.muted,
        fontSize: type.tiny,
        fontWeight: "900",
    },
    miniStatValue: {
        color: colors.ink,
        fontSize: type.small,
        fontWeight: "900",
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: colors.line,
        marginHorizontal: 12,
    },
    heroButton: {
        width: "100%",
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 28,
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    quickCards: {
        gap: 12,
        paddingRight: 20,
    },
    alertCard: {
        gap: 14,
    },
    alertRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    alertBadge: {
        minHeight: 28,
        minWidth: 76,
        borderRadius: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    alertBadgeText: {
        fontSize: type.small,
        fontWeight: "900",
    },
    alertCopy: {
        flex: 1,
        gap: 4,
    },
    alertTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    alertText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    careCard: {
        gap: 14,
    },
    careRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    careIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    careText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
        fontWeight: "700",
    },
    insightCard: {
        gap: 14,
    },
    insightRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    insightDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    insightDotWatch: {
        backgroundColor: colors.periodSoft,
    },
    insightCopy: {
        flex: 1,
        gap: 4,
    },
    insightTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    insightText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    emptyText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});
