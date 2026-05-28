import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { FloatingBubbles } from "../components/FloatingBubbles";
import { IconButton } from "../components/IconButton";
import { QuickActionCard } from "../components/QuickActionCard";
import { SoftButton } from "../components/SoftButton";
import { SoftCard } from "../components/SoftCard";
import { WeekStrip } from "../components/WeekStrip";
import { buildPersonalInsights } from "../cycle";
import { colors, radii, shadow, type } from "../theme";
import { CycleSnapshot, DailyLog, MoodCheckIn, PhaseKey } from "../types";

interface TodayScreenProps {
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
    snapshot,
    moodCheckIns,
    dailyLogs,
    onOpenCheckIn,
    onOpenQuickCheckIn,
    onOpenCalendar,
    onOpenPatterns,
    onOpenSettings,
}: TodayScreenProps) {
    const insights = buildPersonalInsights(moodCheckIns, dailyLogs);
    const careTips = getCareTips(snapshot.phase);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
                <FloatingBubbles />
                <View pointerEvents="none" style={styles.heroCurve} />

                <View style={styles.heroContent}>
                    <View style={styles.topRow}>
                        <View style={styles.logo}>
                            <MaterialCommunityIcons color={colors.primaryDeep} name="moon-waning-crescent" size={22} />
                        </View>
                        <Text style={styles.date}>
                            {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
                        </Text>
                        <IconButton icon="cog-outline" label="Abrir ajustes" onPress={onOpenSettings} />
                    </View>

                    <WeekStrip week={snapshot.week} />

                    <View style={styles.phaseBlock}>
                        <Text style={styles.phaseLabel}>{snapshot.phaseLabel}</Text>
                        <Text style={styles.phaseDay}>Día {snapshot.cycleDay}</Text>
                        <Text style={styles.phaseMessage}>{snapshot.phaseMessage}</Text>
                    </View>

                    <View style={styles.heroStats}>
                        <MiniStat
                            icon="calendar-clock"
                            label="Próxima regla"
                            value={`${snapshot.nextPeriodInDays} días`}
                        />
                        <View style={styles.statDivider} />
                        <MiniStat icon="leaf" label="Ventana fértil" value={fertileValue(snapshot)} />
                    </View>

                    <SoftButton label="Registrar mi día" onPress={onOpenCheckIn} style={styles.heroButton} />
                </View>
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
                    {insights.map((insight, index) => (
                        <View key={insight} style={styles.insightRow}>
                            <View style={styles.insightDot}>
                                <Text style={styles.insightNumber}>{index + 1}</Text>
                            </View>
                            <Text style={styles.insightText}>{insight}</Text>
                        </View>
                    ))}
                </SoftCard>
            </View>
        </ScrollView>
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

function fertileValue(snapshot: CycleSnapshot) {
    if (snapshot.phase === "fertile") return "Ahora";
    const match = snapshot.fertileWindowLabel.match(/\d+/);
    return match ? `En ${match[0]} días` : "Aprox.";
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
        paddingBottom: 32,
        backgroundColor: colors.background,
    },
    hero: {
        minHeight: 474,
        backgroundColor: colors.primarySoft,
        overflow: "hidden",
    },
    heroCurve: {
        position: "absolute",
        left: -38,
        right: -38,
        bottom: -70,
        height: 136,
        borderTopLeftRadius: 138,
        borderTopRightRadius: 138,
        backgroundColor: colors.background,
        zIndex: 1,
    },
    heroContent: {
        zIndex: 2,
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.86)",
        alignItems: "center",
        justifyContent: "center",
        ...shadow,
    },
    date: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    phaseBlock: {
        alignItems: "center",
        marginTop: 38,
    },
    phaseLabel: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "800",
    },
    phaseDay: {
        color: colors.ink,
        fontSize: 44,
        lineHeight: 52,
        fontWeight: "900",
        marginTop: 4,
    },
    phaseMessage: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 22,
        textAlign: "center",
        marginTop: 12,
        maxWidth: 314,
    },
    heroStats: {
        alignSelf: "center",
        marginTop: 20,
        minHeight: 64,
        width: "100%",
        maxWidth: 342,
        borderRadius: radii.lg,
        backgroundColor: "rgba(255,255,255,0.72)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.72)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        ...shadow,
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
        backgroundColor: "rgba(8,124,155,0.12)",
        marginHorizontal: 12,
    },
    heroButton: {
        alignSelf: "center",
        marginTop: 18,
        minWidth: 184,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
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
    insightNumber: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    insightText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
});
