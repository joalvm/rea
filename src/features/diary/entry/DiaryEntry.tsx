import { Pressable, Text, View } from "react-native";

import { styles } from "./DiaryEntryStyle";

type Props = {
    date: string;
    onBack: () => void;
};

export default function DiaryEntry({ date, onBack }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro del Día</Text>
            <Text style={styles.subtitle}>diary/[date].tsx</Text>
            <Text style={styles.date}>Fecha: {date}</Text>
            <Text style={styles.description}>
                Aquí irá el formulario para registrar ánimo, energía, síntomas, flujo, etc.
            </Text>

            <Pressable style={styles.button} onPress={onBack}>
                <Text style={styles.buttonText}>← Volver</Text>
            </Pressable>
        </View>
    );
}
