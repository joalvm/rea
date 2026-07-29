import { Text, View } from "react-native";

import { useCalendarStyles } from "../CalendarStyle";

type Props = {
    color: "danger" | "warning" | "primary";
    label: string;
};

/** Leyenda visual del calendario; mantiene sus variantes de color junto al estilo de la pantalla. */
export function CalendarLegend({ color, label }: Props) {
    const styles = useCalendarStyles();
    const markerStyles = {
        danger: styles.legendMenstruation,
        primary: styles.legendRecord,
        warning: styles.legendFertile,
    };

    return (
        <View accessibilityLabel={label} style={styles.legendItem}>
            <View style={[styles.legendMark, markerStyles[color]]} />
            <Text style={styles.legendLabel}>{label}</Text>
        </View>
    );
}
