import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";
import { TRYING_TO_CONCEIVE_OPTION } from "../constants/onboardingOptions";

interface OnboardingGoalStepProps {
    tryingToConceive: boolean;
    onToggleTryingToConceive: () => void;
}

/** Define el objetivo principal de uso antes de entrar a la app. */
export default function OnboardingGoalStep({ tryingToConceive, onToggleTryingToConceive }: OnboardingGoalStepProps) {
    return (
        <StepShell
            icon="star-four-points-outline"
            subtitle="Entender tu ciclo ya viene incluido. Activa esto solo si también quieres referencias probables de fertilidad."
            title="¿Quieres sumar búsqueda de embarazo?"
        >
            <View style={styles.goals}>
                <Pressable
                    onPress={onToggleTryingToConceive}
                    style={[styles.goal, tryingToConceive && styles.goalActive]}
                >
                    <MaterialCommunityIcons
                        color={colors.primaryDeep}
                        name={TRYING_TO_CONCEIVE_OPTION.icon as never}
                        size={22}
                    />
                    <View style={styles.goalText}>
                        <Text style={styles.goalTitle}>{TRYING_TO_CONCEIVE_OPTION.label}</Text>
                        <Text style={styles.goalDescription}>{TRYING_TO_CONCEIVE_OPTION.description}</Text>
                    </View>
                    <MaterialCommunityIcons
                        color={tryingToConceive ? colors.primaryDeep : colors.muted}
                        name={tryingToConceive ? "check-circle" : "circle-outline"}
                        size={22}
                    />
                </Pressable>
            </View>
        </StepShell>
    );
}
