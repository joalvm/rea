import { Text, View } from "react-native";

import { useHomeStyles } from "../HomeStyle";

type Props = {
    label: string;
};

/** Chip de resumen diario. Solo presenta una etiqueta ya resuelta por el feature Home. */
export function HomeSummaryChip({ label }: Props) {
    const styles = useHomeStyles();

    return (
        <View style={styles.chip}>
            <Text style={styles.chipText}>{label}</Text>
        </View>
    );
}
