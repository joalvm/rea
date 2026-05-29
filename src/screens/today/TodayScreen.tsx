import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { toIsoDate } from "@/modules/cycle/shared/cycleDate.utils";
import { colors } from "@/theme";
import { Cycle, CycleSnapshot } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { FloatingBubbles } from "@/ui/FloatingBubbles";
import { IconButton } from "@/ui/IconButton";
import { QuickActionCard } from "@/ui/QuickActionCard";
import { SoftButton } from "@/ui/SoftButton";
import { SoftCard } from "@/ui/SoftCard";
import { WeekStrip } from "@/ui/WeekStrip";
import styles from "./TodayScreen.styles";
import MiniStat from "./components/MiniStat";
import { buildTodaySummaries, buildWeekPages, getAlertTone, getCareTips, getHeroSupport } from "./utils/todayContent";
import getHeroTheme from "./utils/todayHeroTheme";

/** Props del screen principal de hoy. */
interface TodayScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    snapshot: CycleSnapshot;
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
    onOpenCheckIn: () => void;
    onOpenDay: (iso: string) => void;
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
    onOpenDay,
    onOpenQuickCheckIn,
    onOpenCalendar,
    onOpenPatterns,
    onOpenSettings,
}: TodayScreenProps) {
    const heroTheme = getHeroTheme(snapshot.phase);
    const { insights, alerts } = buildTodaySummaries(settings, cycles, dailyLogs, moodCheckIns);
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
