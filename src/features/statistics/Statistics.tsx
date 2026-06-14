import { Text, View } from "react-native";

import { styles } from "./StatisticsStyle";

export default function Statistics() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Estadísticas</Text>
            <Text style={styles.description}>
                Resumen de análisis y pronósticos, aquí se mostrarán gráficos y estadísticas relevantes para el usuario.
            </Text>
        </View>
    );
}
