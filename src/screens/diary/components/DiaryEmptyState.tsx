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
    label = "Todavía no hay nada por aquí. En cuanto empieces a registrar, este espacio se va llenando.",
}: DiaryEmptyStateProps) {
    return (
        <SoftCard style={styles.empty} tone="primary" variant="soft">
            <MaterialCommunityIcons color={colors.primaryDeep} name="notebook-outline" size={28} />
            <Text style={styles.emptyText}>{label}</Text>
        </SoftCard>
    );
}
