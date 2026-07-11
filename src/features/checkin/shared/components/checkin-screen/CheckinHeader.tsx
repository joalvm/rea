import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useCheckinHeaderStyles } from "./CheckinHeaderStyle";

type Props = {
    Icon: LucideIcon;
    title: string;
    lead?: string;
    accent?: string;
};

/**
 * Cabecera de cada paso del check-in: icono de paso en burbuja, título y bajada.
 * Es el equivalente local de `ScreenHeader` del onboarding (check-in no importa
 * de otro feature). El icono identifica el paso —nunca un número—, en línea con
 * `icons.html §03`.
 */
export function CheckinHeader({ Icon, title, lead, accent }: Props) {
    const theme = useTheme();
    const styles = useCheckinHeaderStyles();
    const onColor = accent ?? theme.colors.primary;

    return (
        <View style={styles.wrap}>
            <View style={[styles.blob, { backgroundColor: theme.colors.primaryTint }]}>
                <Icon size={theme.sizing.iconLg} color={onColor} strokeWidth={2.2} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {lead ? <Text style={styles.lead}>{lead}</Text> : null}
        </View>
    );
}
