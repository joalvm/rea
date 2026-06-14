import { Text, View } from "react-native";

import { styles } from "./CalendarStyle";

export default function Calendar() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Calendario</Text>
            <Text style={styles.subtitle}>(tabs)/calendar.tsx</Text>
        </View>
    );
}
