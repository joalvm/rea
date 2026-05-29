import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { SoftCard } from "../../../ui/SoftCard";
import styles from "../PatternsScreen.styles";
import { AlertCardProps } from "../patterns.types";
import getAlertTone from "../utils/getAlertTone";

/** Renderiza una alerta educativa con su gravedad visual. */
export default function AlertCard({ alert }: AlertCardProps) {
    const tone = getAlertTone(alert.severity);

    return (
        <SoftCard style={styles.alertCard}>
            <View style={styles.alertHeader}>
                <View style={[styles.alertBadge, { backgroundColor: tone.background }]}>
                    <Text style={[styles.alertBadgeText, { color: tone.ink }]}>{tone.label}</Text>
                </View>
                <MaterialCommunityIcons color={tone.ink} name={tone.icon as never} size={18} />
            </View>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertText}>{alert.detail}</Text>
        </SoftCard>
    );
}
