import { Pressable, Text, View } from "react-native";

import { styles } from "./CompleteStyle";

type Props = {
    onFinish: () => void;
};

export default function Complete({ onFinish }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Onboarding Completado!</Text>
            <Text style={styles.subtitle}>(onboarding)/complete.tsx</Text>
            <Pressable style={styles.button} onPress={onFinish}>
                <Text style={styles.buttonText}>Ir al Inicio (Tabs) →</Text>
            </Pressable>
        </View>
    );
}
