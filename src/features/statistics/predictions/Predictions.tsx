import { Text, View } from "react-native";

import { styles } from "./PredictionsStyle";

export default function Predictions() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Pronósticos</Text>
            <Text style={styles.subtitle}>stats/predictions.tsx</Text>
            <Text style={styles.description}>Próxima regla, ovulación, niveles de dolor esperados, etc.</Text>
        </View>
    );
}
