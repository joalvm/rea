import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import styles from "../TodayScreen.styles";
import { TodayMiniStatProps } from "../today.types";

/** Muestra una mini estadística dentro del hero de Hoy. */
export default function MiniStat({ icon, label, value, iconColor, labelColor, valueColor }: TodayMiniStatProps) {
    return (
        <View style={styles.miniStat}>
            <MaterialCommunityIcons color={iconColor} name={icon as never} size={18} />
            <View style={styles.miniStatCopy}>
                <Text style={[styles.miniStatLabel, { color: labelColor }]}>{label}</Text>
                <Text numberOfLines={1} style={[styles.miniStatValue, { color: valueColor }]}>
                    {value}
                </Text>
            </View>
        </View>
    );
}
