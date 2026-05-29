import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import styles from "../CalendarScreen.styles";

interface CalendarLegendProps {
    color: string;
    icon: string;
    label: string;
}

/** Muestra chip explicativo usado en resumen y leyenda del calendario. */
export default function CalendarLegend({ color, icon, label }: CalendarLegendProps) {
    return (
        <View style={styles.legendItem}>
            <MaterialCommunityIcons color={color} name={icon as never} size={15} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
}
