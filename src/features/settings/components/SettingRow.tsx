import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";
import styles from "../SettingsModal.styles";

/** Props de una fila accionable dentro del modal de ajustes. */
interface SettingRowProps {
    title: string;
    text: string;
    meta: string;
    icon: string;
    onPress: () => void;
}

/** Renderiza una fila accionable dentro del modal de ajustes. */
export default function SettingRow({ title, text, meta, icon, onPress }: SettingRowProps) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            <View style={styles.rowIcon}>
                <MaterialCommunityIcons color={colors.primaryDeep} name={icon as never} size={24} />
            </View>
            <View style={styles.rowBody}>
                <View style={styles.rowTitleLine}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.rowMeta}>{meta}</Text>
                </View>
                <Text style={styles.cardText}>{text}</Text>
            </View>
            <MaterialCommunityIcons color={colors.muted} name="chevron-right" size={24} />
        </Pressable>
    );
}
