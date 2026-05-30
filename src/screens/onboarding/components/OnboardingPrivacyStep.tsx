import { Text } from "react-native";

import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

/** Muestra la introducción privada y local del onboarding. */
export default function OnboardingPrivacyStep() {
    return (
        <StepShell
            icon="shield-check-outline"
            subtitle="Datos en tu teléfono. Sin cuenta, sin nube, sin contenido invasivo."
            title="Tu ciclo, en privado."
        >
            <Text style={styles.body}>Vamos a separar lo que registras de lo que solo se estima.</Text>
            <Text style={styles.body}>
                Si ya tenías datos guardados, puedes importar tu respaldo antes de continuar.
            </Text>
        </StepShell>
    );
}
