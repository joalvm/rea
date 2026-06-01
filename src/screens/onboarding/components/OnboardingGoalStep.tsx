import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";
import { Goal } from "@/types/settings.types";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";
import { GOALS } from "../constants/onboardingOptions";

interface OnboardingGoalStepProps {
    goals: Goal[];
    onToggleGoal: (value: Goal) => void;
}

/** Define el objetivo principal de uso antes de entrar a la app. */
export default function OnboardingGoalStep({ goals, onToggleGoal }: OnboardingGoalStepProps) {
    return (
        <StepShell
            icon="star-four-points-outline"
            subtitle="Puedes marcar una o ambas. Esto solo ajusta qué señales quieres tener más presentes al empezar."
            title="¿Qué te gustaría seguir desde el inicio?"
        >
            <View style={styles.goals}>
                {GOALS.map((item) => (
                    <Pressable
                        key={item.key}
                        onPress={() => onToggleGoal(item.key)}
                        style={[styles.goal, goals.includes(item.key) && styles.goalActive]}
                    >
                        <MaterialCommunityIcons color={colors.primaryDeep} name={item.icon as never} size={22} />
                        <View style={styles.goalText}>
                            <Text style={styles.goalTitle}>{item.label}</Text>
                            <Text style={styles.goalDescription}>{item.description}</Text>
                        </View>
                        <MaterialCommunityIcons
                            color={goals.includes(item.key) ? colors.primaryDeep : colors.muted}
                            name={goals.includes(item.key) ? "check-circle" : "circle-outline"}
                            size={22}
                        />
                    </Pressable>
                ))}
            </View>
        </StepShell>
    );
}
