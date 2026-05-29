import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

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
                            {date.toLocaleDateString("es-PE", { day: "numeric", month: "short" })} ·{" "}
                            {date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                    </View>
                    <Pressable accessibilityRole="button" onPress={onEdit} style={styles.editButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="pencil-outline" size={18} />
                    </Pressable>
                </View>
                <View style={styles.metrics}>
                    <DiaryMetric label="Ánimo" value={item.mood} />
                    <DiaryMetric label="Energía" value={item.energy} />
                    <DiaryMetric label="Dolor" value={item.pain} />
                    <DiaryMetric label="Pecho" value={item.breastSensitivity} />
                    <DiaryMetric label="Estrés" value={item.stress} />
                </View>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
        </SoftCard>
    );
}
