import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "../../../theme";
import { Goal } from "../../../types/settings.types";
import { StepShell } from "../../../ui/StepShell";
import styles from "../OnboardingScreen.styles";
import { GOALS } from "../constants/onboardingOptions";

interface OnboardingGoalStepProps {
    goal: Goal;
    onChangeGoal: (value: Goal) => void;
}

/** Define el objetivo principal de uso antes de entrar a la app. */
export default function OnboardingGoalStep({ goal, onChangeGoal }: OnboardingGoalStepProps) {
    return (
        <StepShell
            icon="star-four-points-outline"
            subtitle="Esto no diagnostica ni promete precisión."
            title="¿Qué quieres priorizar?"
        >
            <View style={styles.goals}>
                {GOALS.map((item) => (
                    <Pressable
                        key={item.key}
                        onPress={() => onChangeGoal(item.key)}
                        style={[styles.goal, goal === item.key && styles.goalActive]}
                    >
                        <MaterialCommunityIcons color={colors.primaryDeep} name={item.icon as never} size={26} />
                        <View style={styles.goalText}>
                            <Text style={styles.goalTitle}>{item.label}</Text>
                            <Text style={styles.goalDescription}>{item.description}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
        </StepShell>
    );
}
