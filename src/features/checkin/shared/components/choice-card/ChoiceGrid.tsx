import type { ReactNode } from "react";
import { Children } from "react";
import { View } from "react-native";

import { useTheme } from "@/theme/useTheme";

type Props = {
    /** Número de columnas del grid. Default 2. */
    columns?: 2 | 3;
    /** Hijos; normalmente una lista de `ChoiceCard`. */
    children: ReactNode;
};

/**
 * Contenedor grid para `ChoiceCard`. Envuelve cada hijo en un `View` con
 * `flexBasis` porcentual para forzar el número de columnas; el espacio entre
 * tarjetas se resuelve con `gap` (RN 0.71+). Es el espejo RN de `.choice-grid`
 * / `.choice-grid.three` del design-system HTML.
 */
export function ChoiceGrid({ columns = 2, children }: Props) {
    const theme = useTheme();
    const basis = `${Math.floor(100 / columns)}%` as `${number}%`;

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.spacing.md,
            }}
        >
            {Children.map(children, (child) => (
                <View style={{ flexBasis: basis, flexGrow: 1, flexShrink: 0 }}>{child}</View>
            ))}
        </View>
    );
}
