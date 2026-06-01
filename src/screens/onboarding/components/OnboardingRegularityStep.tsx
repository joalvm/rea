import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";
import { Regularity } from "@/types/settings.types";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";
import { REGULARITY } from "../constants/onboardingOptions";

interface OnboardingRegularityStepProps {
    hormonalContraception: boolean;
    onChangeRegularity: (value: Regularity) => void;
    onToggleHormonalContraception: () => void;
    regularity: Regularity;
}

/** Configura regularidad percibida y anticoncepción hormonal. */
export default function OnboardingRegularityStep({
    hormonalContraception,
    onChangeRegularity,
    onToggleHormonalContraception,
    regularity,
}: OnboardingRegularityStepProps) {
    return (
        <StepShell
            icon="chart-timeline-variant"
            subtitle="Esto nos ayuda a mostrar con más honestidad qué tan confiable es lo estimado al inicio."
            title="¿Tu regla suele llegar en fechas parecidas?"
        >
            <View style={styles.segmentGroup}>
                {REGULARITY.map((item) => (
                    <Pressable
                        key={item.key}
                        onPress={() => onChangeRegularity(item.key)}
                        style={[styles.segment, regularity === item.key && styles.segmentActive]}
                    >
                        <Text style={[styles.segmentText, regularity === item.key && styles.segmentTextActive]}>
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <Pressable
                onPress={onToggleHormonalContraception}
                style={[styles.toggleRow, hormonalContraception && styles.toggleRowActive]}
            >
                <Text style={styles.toggleText}>Estoy usando anticonceptivos hormonales</Text>
                <MaterialCommunityIcons
                    color={hormonalContraception ? colors.primaryDeep : colors.muted}
                    name={hormonalContraception ? "check-circle" : "circle-outline"}
                    size={24}
                />
            </Pressable>
        </StepShell>
    );
}
