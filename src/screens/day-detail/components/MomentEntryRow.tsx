import { Text, View } from "react-native";

import styles from "../DayDetailScreen.styles";
import { MoodCheckIn } from "@/types/records.types";
import { momentLabel } from "../utils/dayDetailContent";

/** Props de una fila de momento guardado dentro del detalle. */
interface DayDetailMomentRowProps {
    entry: MoodCheckIn;
}

/** Renderiza un momento guardado del día con su resumen rápido. */
export default function MomentEntryRow({ entry }: DayDetailMomentRowProps) {
    return (
        <View style={styles.momentRow}>
            <View style={styles.momentCopy}>
                <Text style={styles.momentTitle}>{momentLabel(entry.momentType)}</Text>
                <Text style={styles.metaLine}>
                    {new Date(entry.datetime).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
            <View style={styles.momentMetrics}>
                <Text style={styles.metric}>Ánimo {entry.mood}/5</Text>
                <Text style={styles.metric}>Dolor {entry.pain}/5</Text>
                <Text style={styles.metric}>Pecho {entry.breastSensitivity}/5</Text>
            </View>
            {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
        </View>
    );
}
