import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { ScreenLead } from "../screen-lead/ScreenLead";
import { ScreenTitle } from "../screen-title/ScreenTitle";
import { StepBadge } from "../step-badge/StepBadge";
import { useScreenHeaderStyles } from "./ScreenHeaderStyle";

type Props = {
    Icon: LucideIcon;
    title: string;
    lead: string;
    accent?: string;
};

/**
 * Cabecera centrada de las pantallas de captura: insignia ilustrada (icono en
 * blob) sobre el título y la bajada, todo centrado y con aire. Bienvenida y
 * cierre usan la ilustración de personaje completa en su lugar.
 */
export function ScreenHeader({ Icon, title, lead, accent }: Props) {
    const styles = useScreenHeaderStyles();

    return (
        <View style={styles.wrap}>
            <StepBadge Icon={Icon} accent={accent} />
            <ScreenTitle center accent={accent}>
                {title}
            </ScreenTitle>
            <ScreenLead center>{lead}</ScreenLead>
        </View>
    );
}
