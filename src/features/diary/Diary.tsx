import { Text, View } from "react-native";

import { styles } from "./DiaryStyle";

export default function Diary() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de lo que se va registrando para hoy</Text>
            <Text style={styles.description}>
                Un listado bien estructurado de los registros diarios, con la posibilidad de agregar nuevos registros o
                editar los existentes. Aquí se mostrarán las entradas del día, como el estado de ánimo, actividades
                realizadas, pensamientos, etc.
            </Text>
        </View>
    );
}
