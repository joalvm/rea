import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useCurrentPrediction } from "@/domain/hooks/useCurrentPrediction";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useStatisticsData } from "@/domain/hooks/useStatisticsData";
import { computeFertilitySignals } from "@/domain/stats/computeFertilitySignals";
import { formatDate } from "@/modules/l10n/formatDate";
import { usePredictionsStyles } from "./PredictionsStyle";

/** Segmento de Estadísticas: predicción próxima y señales de fertilidad observadas. */
export default function PredictionsScreen() {
    const { t } = useTranslation("predictions");
    const styles = usePredictionsStyles();
    const { profile } = useLocalProfile();
    const profileId = profile?.id ?? "";
    const { intent } = useActiveIntent(profileId);
    const { prediction } = useCurrentPrediction(profileId);
    const data = useStatisticsData();
    const fertility = computeFertilitySignals(data.checkins);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("title")}</Text>
            <Text style={styles.description}>{t("description")}</Text>
            <View style={styles.links}>
                {prediction ? (
                    <View style={styles.linkRow}>
                        <Text style={styles.linkLabel}>{t("nextPeriod")}</Text>
                        <Text style={styles.linkHint}>{formatDate(prediction.predictedNextStart, "long")}</Text>
                        {prediction.predictedFertileStart && prediction.predictedFertileEnd ? (
                            <Text style={styles.linkHint}>
                                {t("fertileWindow")}: {formatDate(prediction.predictedFertileStart, "long")} –{" "}
                                {formatDate(prediction.predictedFertileEnd, "long")}
                            </Text>
                        ) : null}
                        {prediction.predictedOvulation ? (
                            <Text style={styles.linkHint}>
                                {t("ovulation")}: {formatDate(prediction.predictedOvulation, "long")}
                            </Text>
                        ) : null}
                        <Text style={styles.linkHint}>{t("confidence", { value: prediction.confidence })}</Text>
                    </View>
                ) : (
                    <Text style={styles.description}>{t("noPrediction")}</Text>
                )}
                {intent?.reproductiveMode === "tracking_ttc" ? (
                    <View style={styles.linkRow}>
                        <Text style={styles.linkLabel}>{t("fertilityTitle")}</Text>
                        <Text style={styles.linkHint}>{t("bbt", { count: fertility.basalTemperatureEntries })}</Text>
                        <Text style={styles.linkHint}>{t("mucus", { count: fertility.fertileMucusEntries })}</Text>
                        <Text style={styles.linkHint}>{t("opk", { count: fertility.positiveOpkEntries })}</Text>
                        <Text style={styles.linkHint}>{t("ttcNote")}</Text>
                    </View>
                ) : intent?.reproductiveMode === "tracking_avoid_pregnancy" ? (
                    <View style={styles.linkRow}>
                        <Text style={styles.linkHint}>{t("avoidNote")}</Text>
                    </View>
                ) : null}
                <Text style={styles.description}>{t("disclaimer")}</Text>
            </View>
        </ScrollView>
    );
}
