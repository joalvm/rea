import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { usePregnancyEpisode } from "@/domain/hooks/usePregnancyEpisode";
import { closePregnancyEpisode } from "@/domain/pregnancy/closePregnancyEpisode";
import { computePregnancyProgress } from "@/domain/pregnancy/computePregnancyProgress";
import { useDatabase } from "@/db/useDatabase";
import { formatDate } from "@/modules/l10n/formatDate";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";
import { usePregnancyStyles } from "./PregnancyStyle";

const OUTCOMES = ["birth", "loss", "other"] as const;

/** Ajustes del episodio activo: semana, procedencia de datación y cierres explícitos. */
export default function PregnancyScreen() {
    const { t } = useTranslation("pregnancy");
    const styles = usePregnancyStyles();
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const { episode } = usePregnancyEpisode(profile?.id ?? "");
    const today = ymdToISO(todayYMD());

    const closeEpisode = (outcome: (typeof OUTCOMES)[number]) => {
        if (!profile || !episode) return;
        Alert.alert(t("closeTitle"), t("closeBody"), [
            { text: t("cancel"), style: "cancel" },
            {
                text: t(`outcome.${outcome}`),
                style: outcome === "loss" ? "destructive" : "default",
                onPress: () => {
                    void closePregnancyEpisode(database, {
                        profileId: profile.id,
                        episodeId: episode.id,
                        endDate: today,
                        outcome,
                    }).catch(() => Alert.alert(t("error")));
                },
            },
        ]);
    };

    const progress = episode ? computePregnancyProgress(episode.lmpDate, today) : null;

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("title")}</Text>
            <Text style={styles.description}>{t("description")}</Text>
            {episode && progress ? (
                <>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t("activeTitle")}</Text>
                        <Text style={styles.metric}>{t("week", progress)}</Text>
                        <Text style={styles.metric}>{t("trimester", { trimester: progress.trimester })}</Text>
                        <Text style={styles.detail}>
                            {progress.isBeyondDueDate
                                ? t("beyondDueDate")
                                : t("daysRemaining", { count: progress.daysRemaining })}
                        </Text>
                        <Text style={styles.detail}>{t("lmpDate", { date: formatDate(episode.lmpDate, "long") })}</Text>
                        <Text style={styles.detail}>
                            {t("dueDate", { date: formatDate(episode.dueDate ?? "", "long") })}
                        </Text>
                        <Text style={styles.detail}>
                            {t("datingBasis", { basis: t(`basis.${episode.datingBasis}`) })}
                        </Text>
                    </View>
                    <View style={styles.links}>
                        {OUTCOMES.map((outcome) => (
                            <Pressable
                                key={outcome}
                                accessibilityRole="button"
                                onPress={() => closeEpisode(outcome)}
                                style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                            >
                                <Text style={styles.secondaryText}>{t(`outcome.${outcome}`)}</Text>
                            </Pressable>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("noActiveTitle")}</Text>
                    <Text style={styles.detail}>{t("noActiveBody")}</Text>
                </View>
            )}
        </ScrollView>
    );
}
