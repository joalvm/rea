import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatShortDate, formatTime } from "@/modules/localization/formatters";
import { colors } from "@/theme";
import { MoodCheckIn } from "@/types/records.types";
import { SoftCard } from "@/ui/SoftCard";
import styles from "../DiaryScreen.styles";
import DiaryMetric from "./DiaryMetric";
import { momentIcon, momentLabel } from "../utils/diaryLabels";

/** Props de una fila de check-in puntual. */
interface DiaryCheckInRowProps {
    item: MoodCheckIn;
    onEdit: () => void;
}

/** Renderiza un check-in puntual con métricas resumidas y edición. */
export default function CheckInRow({ item, onEdit }: DiaryCheckInRowProps) {
    const { t } = useTranslation("diary");
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
                            {formatShortDate(date)} · {formatTime(date)}
                        </Text>
                    </View>
                    <Pressable accessibilityRole="button" onPress={onEdit} style={styles.editButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="pencil-outline" size={18} />
                    </Pressable>
                </View>
                <View style={styles.metrics}>
                    <DiaryMetric label={t("metrics.mood")} value={item.mood} />
                    <DiaryMetric label={t("metrics.energy")} value={item.energy} />
                    <DiaryMetric label={t("metrics.pain")} value={item.pain} />
                    <DiaryMetric label={t("metrics.breast")} value={item.breastSensitivity} />
                    <DiaryMetric label={t("metrics.stress")} value={item.stress} />
                </View>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
        </SoftCard>
    );
}
