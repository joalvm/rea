import { Pressable, Text, View } from "react-native";

import { styles } from "./WelcomeStyle";

type Props = {
    onContinue: () => void;
};

export default function Welcome({ onContinue }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Bienvenida</Text>
            <Text style={styles.subtitle}>(onboarding)/welcome.tsx</Text>
            <Pressable style={styles.button} onPress={onContinue}>
                <Text style={styles.buttonText}>Ir a Configurar Ciclo →</Text>
            </Pressable>
        </View>
    );
}
