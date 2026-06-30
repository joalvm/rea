import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useStepBadgeStyles } from "./StepBadgeStyle";

type Props = {
    Icon: LucideIcon;
    accent?: string;
};

/**
 * Cabecera ilustrada ligera para pantallas de captura: un blob de tinte celeste
 * con un ícono de línea. Da calidez sin robar espacio al formulario (la
 * ilustración de personaje completa se reserva a bienvenida y cierre).
 */
export function StepBadge({ Icon, accent }: Props) {
    const theme = useTheme();
    const styles = useStepBadgeStyles();

    return (
        <View style={styles.halo}>
            <View style={styles.blob}>
                <Icon size={28} color={accent ?? theme.colors.link} strokeWidth={1.9} />
            </View>
        </View>
    );
}
