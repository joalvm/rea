import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation("checkIn");

    return (
        <View style={styles.header}>
            <ScreenHeader
                kicker={
                    isEditing
                        ? t("header.editKicker")
                        : mode === "daily"
                          ? t("header.dailyKicker")
                          : t("header.quickKicker")
                }
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
