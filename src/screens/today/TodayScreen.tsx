import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import buildEducationalAlerts from "../../modules/cycle/alerts/buildEducationalAlerts";
import estimateCycle from "../../modules/cycle/estimation/estimateCycle";
import buildPatternInsights from "../../modules/cycle/insights/buildPatternInsights";
import { addDays, toIsoDate } from "../../modules/cycle/shared/cycleDate.utils";
import { colors, radii, shadow, type } from "../../theme";
import { Cycle, CycleSnapshot, PhaseKey } from "../../types/cycle.types";
import { EducationalAlert } from "../../types/insights.types";
import { DailyLog } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";
import { FloatingBubbles } from "../../ui/FloatingBubbles";
import { IconButton } from "../../ui/IconButton";
import { QuickActionCard } from "../../ui/QuickActionCard";
import { SoftButton } from "../../ui/SoftButton";
import { SoftCard } from "../../ui/SoftCard";
import { WeekStrip, WeekStripDay } from "../../ui/WeekStrip";
import { TodayScreenProps } from "./today.types";

export function TodayScreen({
    settings,
    cycles,
    snapshot,
    moodCheckIns,
    dailyLogs,
    onOpenCheckIn,
    onOpenDay,
    onOpenQuickCheckIn,
    onOpenCalendar,
    onOpenPatterns,
    onOpenSettings,
}: TodayScreenProps) {
    const heroTheme = getHeroTheme(snapshot.phase);
    const insights = buildPatternInsights(settings, cycles, dailyLogs, moodCheckIns);
    const alerts = buildEducationalAlerts(settings, cycles, dailyLogs, moodCheckIns).slice(0, 2);
    const careTips = getCareTips(snapshot.phase);
    const heroSupport = getHeroSupport(snapshot);
    const todayIso = snapshot.week.find((day) => day.isToday)?.iso ?? toIsoDate(new Date());
    const weekPages = buildWeekPages(settings, cycles, dailyLogs, todayIso);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, { backgroundColor: heroTheme.background }]}>
                <FloatingBubbles palette={heroTheme.bubbleColors} />
                <View pointerEvents="none" style={[styles.heroGlow, { backgroundColor: heroTheme.glow }]} />
                <View pointerEvents="none" style={[styles.heroCurve, { backgroundColor: heroTheme.background }]} />

                <View style={styles.heroContent}>
                    <View style={styles.topRow}>
                        <Text style={[styles.date, { color: heroTheme.dateColor }]}>
                            {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
                        </Text>
                        <IconButton
                            backgroundColor={heroTheme.iconButtonBackground}
                            color={heroTheme.iconButtonColor}
                            icon="cog-outline"
                            label="Abrir ajustes"
                            onPress={onOpenSettings}
                        />
                    </View>

                    <WeekStrip
                        initialPage={Math.floor(weekPages.length / 2)}
                        onSelectDay={onOpenDay}
                        palette={heroTheme.weekPalette}
                        weeks={weekPages}
                    />

                    <View style={styles.phaseBlock}>
                        <View style={styles.phaseHeading}>
                            <MaterialCommunityIcons
                                color={heroTheme.scenePillColor}
                                name={heroTheme.phaseIcon as never}
                                size={20}
                            />
                            <Text style={[styles.phaseHeadingText, { color: heroTheme.scenePillColor }]}>
                                {snapshot.phaseLabel}
                            </Text>
                        </View>

                        <View style={styles.phaseDayRow}>
                            <View
                                style={[
                                    styles.dayBadge,
                                    {
                                        backgroundColor: heroTheme.dayBadgeBackground,
                                        borderColor: heroTheme.dayBadgeBorder,
                                    },
                                ]}
                            >
                                <Text style={[styles.dayBadgeText, { color: heroTheme.dayBadgeColor }]}>Día</Text>
                            </View>
                            <Text style={[styles.phaseDay, { color: heroTheme.titleColor }]}>{snapshot.cycleDay}</Text>
                        </View>
                        <Text style={[styles.phaseMessage, { color: heroTheme.messageColor }]}>
                            {snapshot.phaseMessage}
                        </Text>
                        {heroSupport ? (
                            <Text style={[styles.phaseSupport, { color: heroTheme.supportColor }]}>{heroSupport}</Text>
                        ) : null}
                    </View>

                    <View
                        style={[
                            styles.heroStats,
                            {
                                backgroundColor: heroTheme.statCardBackground,
                                borderColor: heroTheme.statCardBorder,
                            },
                        ]}
                    >
                        <MiniStat
                            icon="calendar-clock"
                            iconColor={heroTheme.statIconColor}
                            label="Próxima regla"
                            labelColor={heroTheme.statLabelColor}
                            value={snapshot.nextPeriodLabel}
                            valueColor={heroTheme.statValueColor}
                        />
                        <View style={[styles.statDivider, { backgroundColor: heroTheme.dividerColor }]} />
                        <MiniStat
                            icon="leaf"
                            iconColor={heroTheme.statIconColor}
                            label={snapshot.fertilityVisible ? "Ventana fértil" : "Fertilidad"}
                            labelColor={heroTheme.statLabelColor}
                            value={snapshot.fertilityStatusLabel}
                            valueColor={heroTheme.statValueColor}
                        />
                    </View>

                    <SoftButton
                        icon={<MaterialCommunityIcons color={heroTheme.buttonTextColor} name="heart-pulse" size={18} />}
                        label="Hoy me siento"
                        labelStyle={{ color: heroTheme.buttonTextColor }}
                        loadingColor={heroTheme.buttonTextColor}
                        onPress={onOpenCheckIn}
                        style={[
                            styles.heroButton,
                            {
                                backgroundColor: heroTheme.buttonBackground,
                                borderColor: heroTheme.buttonBorder,
                            },
                        ]}
                    />
                </View>
            </View>

            <View style={[styles.section, styles.firstSection]}>
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

function getHeroTheme(phase: PhaseKey) {
    const baseTheme = {
        background: colors.lutealSoft,
        glow: "rgba(122,94,201,0.08)",
        bubbleColors: [
            "rgba(255,255,255,0.22)",
            "rgba(207,194,235,0.16)",
            "rgba(255,255,255,0.16)",
            "rgba(233,226,248,0.18)",
        ],
        dateColor: colors.ink,
        iconButtonColor: "#6C59A8",
        iconButtonBackground: "rgba(255,255,255,0.82)",
        phaseIcon: "circle-outline",
        scenePillBackground: "rgba(255,255,255,0.76)",
        scenePillBorder: "rgba(122,94,201,0.14)",
        scenePillColor: "#6C59A8",
        titleColor: "#5B4C7E",
        messageColor: "#5E5279",
        supportColor: "#7D7097",
        dayBadgeBackground: "rgba(122,94,201,0.08)",
        dayBadgeBorder: "rgba(122,94,201,0.12)",
        dayBadgeColor: "#8D7DAF",
        statCardBackground: "rgba(255,255,255,0.78)",
        statCardBorder: "rgba(255,255,255,0.72)",
        statIconColor: "#6C59A8",
        statLabelColor: "#7D7097",
        statValueColor: colors.ink,
        dividerColor: "rgba(122,94,201,0.12)",
        buttonBackground: "rgba(255,255,255,0.88)",
        buttonBorder: "rgba(122,94,201,0.32)",
        buttonTextColor: "#6C59A8",
        weekPalette: {
            weekdayColor: "#7D7097",
            todayWeekdayColor: "#5E5279",
            dayTextColor: colors.ink,
            todayBackgroundColor: "#6C59A8",
            todayDayTextColor: colors.surface,
        },
    };

    if (phase === "menstrual") {
        return {
            ...baseTheme,
            background: colors.periodSoft,
            glow: "rgba(248,111,143,0.10)",
            bubbleColors: [
                "rgba(255,255,255,0.22)",
                "rgba(248,111,143,0.10)",
                "rgba(255,255,255,0.14)",
                "rgba(255,208,219,0.16)",
            ],
            iconButtonColor: colors.danger,
            phaseIcon: "water-outline",
            scenePillBorder: "rgba(248,111,143,0.16)",
            scenePillColor: colors.danger,
            titleColor: "#B24662",
            messageColor: "#7A4957",
            supportColor: "#9B6B79",
            dayBadgeBackground: "rgba(219,79,102,0.08)",
            dayBadgeBorder: "rgba(219,79,102,0.12)",
            dayBadgeColor: "#B97084",
            statIconColor: colors.danger,
            statLabelColor: "#9B6B79",
            dividerColor: "rgba(219,79,102,0.12)",
            buttonBorder: "rgba(219,79,102,0.32)",
            buttonTextColor: colors.danger,
            weekPalette: {
                weekdayColor: "#9B6B79",
                todayWeekdayColor: "#7A4957",
                dayTextColor: colors.ink,
                todayBackgroundColor: colors.danger,
                todayDayTextColor: colors.surface,
            },
        };
    }

    if (phase === "follicular") {
        return {
            ...baseTheme,
            phaseIcon: "sprout-outline",
        };
    }

    if (phase === "fertile") {
        return {
            ...baseTheme,
            background: colors.fertileSoft,
            glow: "rgba(61,190,134,0.10)",
            bubbleColors: [
                "rgba(255,255,255,0.22)",
                "rgba(61,190,134,0.10)",
                "rgba(255,255,255,0.14)",
                "rgba(203,239,224,0.18)",
            ],
            iconButtonColor: colors.success,
            phaseIcon: "leaf",
            scenePillBorder: "rgba(61,190,134,0.16)",
            scenePillColor: colors.success,
            titleColor: "#2E8A62",
            messageColor: "#3D6F5F",
            supportColor: "#6D8E83",
            dayBadgeBackground: "rgba(61,190,134,0.08)",
            dayBadgeBorder: "rgba(61,190,134,0.12)",
            dayBadgeColor: "#72A791",
            statIconColor: colors.success,
            statLabelColor: "#6D8E83",
            dividerColor: "rgba(61,190,134,0.12)",
            buttonBorder: "rgba(61,190,134,0.32)",
            buttonTextColor: colors.success,
            weekPalette: {
                weekdayColor: "#6D8E83",
                todayWeekdayColor: "#3D6F5F",
                dayTextColor: colors.ink,
                todayBackgroundColor: colors.success,
                todayDayTextColor: colors.surface,
            },
        };
    }

    return baseTheme;
}

function getHeroSupport(snapshot: CycleSnapshot) {
    if (snapshot.source === "observed") {
        return snapshot.confidence === "high"
            ? null
            : "Base actual: usando tus registros, pero aún puede ajustarse un poco.";
    }

    if (snapshot.source === "estimated") {
        if (snapshot.confidence === "low") {
            return "Base actual: estimación inicial. Se ajusta mejor cuando marques más periodos reales.";
        }

        if (snapshot.confidence === "medium") {
            return "Base actual: estimación provisional. Se afina con más registros.";
        }

        return "Base actual: estimación ya bastante alineada con tus registros recientes.";
    }

    return snapshot.confidenceNote ? `Base actual: ${snapshot.confidenceNote}` : null;
}

function buildWeekPages(settings: AppSettings | null, cycles: Cycle[], dailyLogs: DailyLog[], todayIso: string) {
    const phaseCache = new Map<string, PhaseKey>();

    return Array.from({ length: 15 }, (_, index) => {
        const focusIso = addDays(todayIso, (index - 7) * 7);
        return estimateCycle(settings, cycles, dailyLogs, focusIso).week.map((day): WeekStripDay => {
            const cachedPhase = phaseCache.get(day.iso);
            const phase = cachedPhase ?? estimateCycle(settings, cycles, dailyLogs, day.iso).phase;

            if (!cachedPhase) {
                phaseCache.set(day.iso, phase);
            }

            return {
                ...day,
                isToday: day.iso === todayIso,
                isFuture: day.iso > todayIso,
                phase,
            };
        });
    });
}

function MiniStat({
    icon,
    label,
    value,
    iconColor,
    labelColor,
    valueColor,
}: {
    icon: string;
    label: string;
    value: string;
    iconColor: string;
    labelColor: string;
    valueColor: string;
}) {
    return (
        <View style={styles.miniStat}>
            <MaterialCommunityIcons color={iconColor} name={icon as never} size={18} />
            <View style={styles.miniStatCopy}>
                <Text style={[styles.miniStatLabel, { color: labelColor }]}>{label}</Text>
                <Text numberOfLines={1} style={[styles.miniStatValue, { color: valueColor }]}>
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
        paddingBottom: 32,
        backgroundColor: colors.background,
    },
    hero: {
        minHeight: 492,
        marginBottom: 92,
        overflow: "visible",
    },
    heroGlow: {
        position: "absolute",
        width: 196,
        height: 196,
        borderRadius: 98,
        right: -18,
        top: 116,
    },
    heroCurve: {
        position: "absolute",
        left: -36,
        right: -36,
        bottom: -78,
        height: 124,
        borderBottomLeftRadius: 150,
        borderBottomRightRadius: 150,
        zIndex: 1,
    },
    heroContent: {
        zIndex: 2,
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    date: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    phaseBlock: {
        alignItems: "center",
        marginTop: 34,
    },
    phaseHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    phaseHeadingText: {
        fontSize: 22,
        lineHeight: 26,
        fontWeight: "900",
    },
    phaseDayRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
        marginTop: 8,
    },
    dayBadge: {
        position: "absolute",
        top: 10,
        left: -25,
        minHeight: 22,
        borderRadius: 12,
        paddingHorizontal: 0,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        marginBottom: 8,
    },
    dayBadgeText: {
        fontSize: type.tiny,
        fontWeight: "800",
        paddingHorizontal: 4,
    },
    phaseDay: {
        fontSize: 64,
        lineHeight: 66,
        fontWeight: "900",
    },
    phaseMessage: {
        fontSize: type.body,
        lineHeight: 22,
        textAlign: "center",
        marginTop: 12,
        maxWidth: 314,
    },
    phaseSupport: {
        fontSize: type.small,
        lineHeight: 18,
        textAlign: "center",
        marginTop: 10,
        maxWidth: 320,
    },
    heroStats: {
        alignSelf: "center",
        marginTop: 18,
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
        marginTop: 26,
        minWidth: 184,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    firstSection: {
        marginTop: 4,
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
