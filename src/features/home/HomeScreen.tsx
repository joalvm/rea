import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useContentCatalog } from "@/domain/hooks/useContentCatalog";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useCurrentPrediction } from "@/domain/hooks/useCurrentPrediction";
import { usePeriodProposal } from "@/domain/hooks/usePeriodProposal";
import { useTodaySummary } from "@/domain/hooks/useTodaySummary";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { selectContentCandidates } from "@/domain/content/selectContentCandidates";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";
import { PhaseHero } from "./components/PhaseHero";
import { HomeContentCard } from "./components/HomeContentCard";
import { HomePeriodProposal } from "./components/HomePeriodProposal";
import { HomeSummaryChip } from "./components/HomeSummaryChip";
import { useHomeStyles } from "./HomeStyle";
import { getHomeNextEventLabel, resolveHomePhase } from "./homeViewModel";

type Props = {
    onStartCheckin: () => void;
    onOpenDiary: () => void;
};

export default function HomeScreen({ onStartCheckin, onOpenDiary }: Props) {
    const { t } = useTranslation("home");
    const { i18n } = useTranslation();
    const router = useRouter();
    const styles = useHomeStyles();
    const { profile } = useLocalProfile();
    const profileId = profile?.id ?? "";
    const { summary } = useTodaySummary(profileId);
    const { prediction } = useCurrentPrediction(profileId);
    const { intent } = useActiveIntent(profileId);
    const periodProposal = usePeriodProposal(profileId);
    const locale = i18n.language.startsWith("en") ? "en" : "es";
    const { items: contentItems, rules: contentRules } = useContentCatalog(locale);
    const phase = resolveHomePhase(summary?.estimatedPhase, intent?.reproductiveMode);
    const isPregnancy = intent?.reproductiveMode === "pregnancy_tracking";
    const today = ymdToISO(todayYMD());
    const cycleDay = summary?.cycleDay ?? undefined;
    const statusLabel = isPregnancy
        ? t("hero.pregnancyCaption")
        : summary
          ? t(`hero.confidence.${summary.phaseConfidence}`)
          : t("hero.unknown");
    const pregnancyWeek = summary?.pregnancyWeek ?? undefined;
    const hasSummary = summary !== null && summary.checkinCount > 0;
    const contentItem = selectContentCandidates(contentItems, contentRules, {
        phase: summary?.estimatedPhase,
        pregnancyWeek,
        reproductiveMode: intent?.reproductiveMode,
    }).at(0);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <PhaseHero
                phase={phase}
                dayOfCycle={isPregnancy ? undefined : cycleDay}
                statusLabel={
                    isPregnancy && pregnancyWeek ? t("hero.pregnancyWeek", { week: pregnancyWeek }) : statusLabel
                }
                onPressCta={onStartCheckin}
                ctaLabel={t("hero.cta")}
                ctaTestID="checkin-start"
            />

            <View style={styles.body}>
                <Text style={styles.greeting}>{t("greeting", { name: profile?.name ?? "" })}</Text>
                <HomePeriodProposal proposal={periodProposal} onPress={() => router.push("/period/confirm")} />
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("summary.title")}</Text>
                    {hasSummary ? (
                        <View style={styles.chips}>
                            <HomeSummaryChip label={t("summary.checkins", { count: summary.checkinCount })} />
                            {summary.maxSymptomIntensity > 0 ? (
                                <HomeSummaryChip
                                    label={t("summary.symptoms", { count: summary.maxSymptomIntensity })}
                                />
                            ) : null}
                            {summary.hadMedication ? <HomeSummaryChip label={t("summary.medications")} /> : null}
                        </View>
                    ) : (
                        <Text style={styles.cardText}>{t("summary.empty")}</Text>
                    )}
                    <Pressable
                        onPress={hasSummary ? onOpenDiary : onStartCheckin}
                        accessibilityRole="button"
                        accessibilityLabel={t(hasSummary ? "summary.openDiary" : "summary.start")}
                        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryBtnText}>
                            {t(hasSummary ? "summary.openDiary" : "summary.start")}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("summary.next")}</Text>
                    <Text style={styles.cardText}>
                        {getHomeNextEventLabel(t, intent?.reproductiveMode, prediction, today)}
                    </Text>
                </View>
                {contentItem ? (
                    <HomeContentCard item={contentItem} onPress={() => router.push(`/content/${contentItem.id}`)} />
                ) : null}
                <Text style={styles.disclaimer}>{t("disclaimer")}</Text>
            </View>
        </ScrollView>
    );
}
