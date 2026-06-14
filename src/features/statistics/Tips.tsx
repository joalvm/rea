import { Text, View } from "react-native";

import { styles } from "./TipsStyle";

export default function Tips() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Tips</Text>
            <Text style={styles.subtitle}>stats/tips.tsx</Text>
            <Text style={styles.description}>Recomendaciones personalizadas según la fase del ciclo.</Text>
        </View>
    );
}
