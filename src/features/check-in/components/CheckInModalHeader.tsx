import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "../../../theme";
import { CheckInMode } from "../check-in.types";
import styles from "../CheckInModal.styles";

interface CheckInModalHeaderProps {
    isEditing: boolean;
    mode: CheckInMode;
    question: string;
    onClose: () => void;
}

/** Renderiza encabezado y cierre del modal de registro. */
export default function CheckInModalHeader({ isEditing, mode, question, onClose }: CheckInModalHeaderProps) {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.kicker}>
                    {isEditing ? "Editar registro" : mode === "daily" ? "Tu día" : "Un minuto para ti"}
                </Text>
                <Text style={styles.title}>{question}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
                <MaterialCommunityIcons color={colors.primaryDeep} name="close" size={22} />
            </Pressable>
        </View>
    );
}
