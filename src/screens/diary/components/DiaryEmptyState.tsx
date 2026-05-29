import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";

import { colors } from "@/theme";
import { SoftCard } from "@/ui/SoftCard";
import styles from "../DiaryScreen.styles";

/** Props de tarjeta de estado vacío del diario. */
interface DiaryEmptyStateProps {
    label?: string;
}

/** Renderiza un vacío amable cuando aún no hay historial suficiente. */
export default function DiaryEmptyState({
    label = "Aún no hay datos. Iremos mostrando patrones cuando haya historial suficiente.",
}: DiaryEmptyStateProps) {
    return (
        <SoftCard style={styles.empty}>
            <MaterialCommunityIcons color={colors.primaryDeep} name="notebook-outline" size={28} />
            <Text style={styles.emptyText}>{label}</Text>
        </SoftCard>
    );
}
