import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { CheckInPromptContext } from "@/app/app-shell.types";
import { colors } from "@/theme";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { CheckInMode } from "../check-in.types";
import styles from "../CheckInModal.styles";

interface CheckInModalHeaderProps {
    isEditing: boolean;
    mode: CheckInMode;
    promptContext: CheckInPromptContext;
    onClose: () => void;
}

/** Renderiza encabezado y cierre del modal de registro. */
export default function CheckInModalHeader({ isEditing, mode, promptContext, onClose }: CheckInModalHeaderProps) {
    return (
        <View style={styles.header}>
            <ScreenHeader
                kicker={isEditing ? "Editar registro" : mode === "daily" ? "Tu día" : "Un minuto para ti"}
                subtitle={promptContext.subtitle}
                title={promptContext.title}
                trailing={
                    <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="close" size={22} />
                    </Pressable>
                }
            />
        </View>
    );
}
