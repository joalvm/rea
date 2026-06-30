import type { ReactNode } from "react";
import { View } from "react-native";

import { useWheelGroupStyles } from "./WheelGroupStyle";

type Props = {
    children: ReactNode;
    testID?: string;
};

/**
 * Marco cohesivo para una o más columnas `WheelPicker`. Dibuja la caja
 * casi-blanca de borde fino y una única banda de selección centrada que cruza
 * todas las columnas, de modo que día/mes/año (o las dos horas) se lean como un
 * solo control y no como ruedas sueltas y separadas.
 */
export function WheelGroup({ children, testID }: Props) {
    const styles = useWheelGroupStyles();

    return (
        <View style={styles.group} testID={testID}>
            <View style={styles.band} pointerEvents="none" />
            <View style={styles.row}>{children}</View>
        </View>
    );
}
