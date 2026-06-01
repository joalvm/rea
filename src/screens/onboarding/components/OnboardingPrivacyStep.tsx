import { Text } from "react-native";

import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

/** Muestra la introducción privada y local del onboarding. */
export default function OnboardingPrivacyStep() {
    return (
        <StepShell
            icon="shield-check-outline"
            subtitle="Vamos a dejar una base simple para empezar, sin pedirte más de la cuenta."
            title="Empecemos contigo"
        >
            <Text style={styles.body}>
                Lo que registres y lo que solo se estime se va a ver distinto, para no mezclar referencia con realidad.
            </Text>
            <Text style={styles.body}>
                Si ya habías usado Rea antes, puedes traer tus datos guardados antes de seguir.
            </Text>
        </StepShell>
    );
}
