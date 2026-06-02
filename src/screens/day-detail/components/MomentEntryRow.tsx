import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatTime } from "@/modules/localization/formatters";
import styles from "../DayDetailScreen.styles";
import { MoodCheckIn } from "@/types/records.types";
import { momentLabel } from "../utils/dayDetailContent";

/** Props de una fila de momento guardado dentro del detalle. */
interface DayDetailMomentRowProps {
    entry: MoodCheckIn;
}

/** Renderiza un momento guardado del día con su resumen rápido. */
export default function MomentEntryRow({ entry }: DayDetailMomentRowProps) {
    const { t } = useTranslation("dayDetail");

    return (
        <View style={styles.momentRow}>
            <View style={styles.momentCopy}>
                <Text style={styles.momentTitle}>{momentLabel(entry.momentType)}</Text>
                <Text style={styles.metaLine}>{formatTime(entry.datetime)}</Text>
            </View>
            <View style={styles.momentMetrics}>
                <Text style={styles.metric}>{t("metrics.mood", { value: entry.mood })}</Text>
                <Text style={styles.metric}>{t("metrics.pain", { value: entry.pain })}</Text>
                <Text style={styles.metric}>{t("metrics.breast", { value: entry.breastSensitivity })}</Text>
            </View>
            {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
        </View>
    );
}
