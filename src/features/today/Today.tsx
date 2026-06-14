import { Pressable, Text, View } from "react-native";

import { styles } from "./TodayStyle";

type Props = {
    onOpenDiary: () => void;
};

export default function Today({ onOpenDiary }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Inicio (Home)</Text>
            <Text style={styles.subtitle}>(tabs)/index.tsx</Text>
            <Text style={styles.description}>Aquí irá el Hero con la fase del ciclo, próxima regla, etc.</Text>

            <Pressable style={styles.button} onPress={onOpenDiary}>
                <Text style={styles.buttonText}>Abrir registro del 6 de junio →</Text>
            </Pressable>
        </View>
    );
}
