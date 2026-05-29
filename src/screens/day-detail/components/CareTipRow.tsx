import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import styles from "../DayDetailScreen.styles";
import { DayDetailCareTip } from "../day-detail.types";

/** Props de una fila visual para consejos del día. */
interface DayDetailTipRowProps {
    tip: DayDetailCareTip;
}

/** Renderiza un consejo contextual del día con tono visual propio. */
export default function CareTipRow({ tip }: DayDetailTipRowProps) {
    return (
        <View style={styles.tipRow}>
            <View style={[styles.tipIcon, { backgroundColor: tip.background }]}>
                <MaterialCommunityIcons color={tip.color} name={tip.icon as never} size={18} />
            </View>
            <Text style={styles.tipText}>{tip.text}</Text>
        </View>
    );
}
