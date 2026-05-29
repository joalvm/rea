import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { EducationalAlert } from "@/types/insights.types";
import { SoftCard } from "@/ui/SoftCard";
import styles from "../PatternsScreen.styles";
import getAlertTone from "../utils/getAlertTone";

/** Props de una alerta educativa visual. */
interface AlertCardProps {
    alert: EducationalAlert;
}

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
