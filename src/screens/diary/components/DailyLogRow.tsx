import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatShortDate } from "@/modules/cycle/utils/cycleDate.utils";
import { colors } from "@/theme";
import { DailyLog } from "@/types/records.types";
import { SoftCard } from "@/ui/SoftCard";
import styles from "../DiaryScreen.styles";
import { bleedingLabel, buildDailyLogDetails, sourceLabel, symptomLabel } from "../utils/diaryLabels";

/** Props de una fila de día con registro completo. */
interface DiaryDailyLogRowProps {
    log: DailyLog;
    onEdit: () => void;
}

/** Renderiza un día con registro observacional completo y su edición. */
export default function DailyLogRow({ log, onEdit }: DiaryDailyLogRowProps) {
    const { t } = useTranslation("diary");
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
                            {symptomLabel(symptom)}
                        </Text>
                    ))}
                </View>
            ) : (
                <Text style={styles.rowMeta}>{t("empty.noSymptoms")}</Text>
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
