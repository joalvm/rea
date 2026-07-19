import type { ReactNode } from "react";
import { Children } from "react";
import { View } from "react-native";

import { useChoiceGridStyles } from "./ChoiceGridStyle";

type Props = {
    /** Hijos; normalmente una lista de `ChoiceCard`. */
    children: ReactNode;
};

/**
 * Contenedor grid para `ChoiceCard`. Una sola fila horizontal: cada hijo
 * toma `flex: 1` y se reparte el ancho disponible sin wrap. Pensado para
 * que todas las opciones quepan en una línea compacta (espejo denso del
 * design-system). El número de columnas lo define la cantidad de hijos.
 */
export function ChoiceGrid({ children }: Props) {
    const styles = useChoiceGridStyles();
    const items = Children.toArray(children);

    return (
        <View style={styles.grid}>
            {items.map((child, index) => (
                <View key={index} style={styles.item}>
                    {child}
                </View>
            ))}
        </View>
    );
}
