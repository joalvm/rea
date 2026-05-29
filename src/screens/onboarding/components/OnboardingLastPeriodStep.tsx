import { Pressable, Text, View } from "react-native";

import { addDays, formatShortDate, toIsoDate } from "@/modules/cycle/shared/cycleDate.utils";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

interface OnboardingLastPeriodStepProps {
    lastPeriodStart: string;
    onChange: (iso: string) => void;
}

/** Permite elegir la fecha base del último periodo observado. */
export default function OnboardingLastPeriodStep({ lastPeriodStart, onChange }: OnboardingLastPeriodStepProps) {
    return (
        <StepShell
            icon="calendar-start"
            subtitle="Usaremos esta fecha para calcular el día de ciclo inicial."
            title="¿Cuándo empezó tu última regla?"
        >
            <View style={styles.dateOptions}>
                {[0, 1, 2, 3, 5, 7, 14].map((daysAgo) => {
                    const iso = addDays(toIsoDate(new Date()), -daysAgo);
                    return (
                        <Pressable
                            key={daysAgo}
                            onPress={() => onChange(iso)}
                            style={[styles.option, lastPeriodStart === iso && styles.optionActive]}
                        >
                            <Text style={[styles.optionText, lastPeriodStart === iso && styles.optionTextActive]}>
                                {daysAgo === 0 ? "Hoy" : `Hace ${daysAgo} días`}
                            </Text>
                            <Text style={styles.optionMeta}>{formatShortDate(iso)}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </StepShell>
    );
}
