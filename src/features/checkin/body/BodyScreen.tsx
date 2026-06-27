import { Pressable, ScrollView, Text } from "react-native";

import { useBodyStyles } from "./BodyStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 3: dolor y cuerpo. Ver README. */
export default function BodyScreen({ onContinue }: Props) {
    const styles = useBodyStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Dolor y cuerpo"}</Text>
            <Text style={styles.description}>
                {"Dolor (0-5) y si te impidió hacer algo (interferencia 0-3), sensibilidad mamaria (0-5) y PMS (0-5)."}
            </Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{"Continuar"}</Text>
            </Pressable>
        </ScrollView>
    );
}
