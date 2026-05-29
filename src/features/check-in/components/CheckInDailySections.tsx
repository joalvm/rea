import type { ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { colors } from "../../../theme";
import { BleedingLevel, ClotSize, MedicationRelief, PainImpact } from "../../../types/records.types";
import { MetricScale } from "../../../ui/MetricScale";
import {
    BLEEDING_OPTIONS,
    CLOT_SIZE_OPTIONS,
    MEDICATION_RELIEF_OPTIONS,
    PAIN_IMPACT_OPTIONS,
    SYMPTOMS,
} from "../constants/checkInOptions";
import styles from "../CheckInModal.styles";

interface CheckInDailySectionsProps {
    showStandaloneBreastSensitivity: boolean;
    breastSensitivity: number;
    onBreastSensitivityChange: (value: number) => void;
    bleedingLevel: BleedingLevel;
    onBleedingLevelChange: (value: BleedingLevel) => void;
    symptoms: string[];
    onToggleSymptom: (value: string) => void;
    showPeriodSection: boolean;
    periodStarted: boolean;
    periodEnded: boolean;
    onTogglePeriodStarted: () => void;
    onTogglePeriodEnded: () => void;
    pmsStarted: boolean;
    onTogglePmsStarted: () => void;
    clotSize: ClotSize;
    onClotSizeChange: (value: ClotSize) => void;
    painImpact: PainImpact;
    onPainImpactChange: (value: PainImpact) => void;
    medicationName: string;
    onMedicationNameChange: (value: string) => void;
    medicationRelief: MedicationRelief;
    onMedicationReliefChange: (value: MedicationRelief) => void;
}

interface FormSectionProps {
    title: string;
    children: ReactNode;
}

interface ChoiceChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
}

function FormSection({ title, children }: FormSectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function ChoiceChip({ label, active, onPress }: ChoiceChipProps) {
    return (
        <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </Pressable>
    );
}

/** Renderiza las secciones diarias del formulario observacional. */
export default function CheckInDailySections({
    showStandaloneBreastSensitivity,
    breastSensitivity,
    onBreastSensitivityChange,
    bleedingLevel,
    onBleedingLevelChange,
    symptoms,
    onToggleSymptom,
    showPeriodSection,
    periodStarted,
    periodEnded,
    onTogglePeriodStarted,
    onTogglePeriodEnded,
    pmsStarted,
    onTogglePmsStarted,
    clotSize,
    onClotSizeChange,
    painImpact,
    onPainImpactChange,
    medicationName,
    onMedicationNameChange,
    medicationRelief,
    onMedicationReliefChange,
}: CheckInDailySectionsProps) {
    return (
        <>
            {showStandaloneBreastSensitivity ? (
                <MetricScale
                    highLabel="Muy sensible"
                    label="Sensibilidad mamaria"
                    lowLabel="Nada"
                    min={0}
                    onChange={onBreastSensitivityChange}
                    value={breastSensitivity}
                />
            ) : null}

            <FormSection title="Sangrado">
                <View style={styles.chips}>
                    {BLEEDING_OPTIONS.map((item) => (
                        <ChoiceChip
                            active={bleedingLevel === item.key}
                            key={item.key}
                            label={item.label}
                            onPress={() => onBleedingLevelChange(item.key)}
                        />
                    ))}
                </View>
            </FormSection>

            <FormSection title="Síntomas">
                <View style={styles.chips}>
                    {SYMPTOMS.map((symptom) => (
                        <ChoiceChip
                            active={symptoms.includes(symptom)}
                            key={symptom}
                            label={symptom}
                            onPress={() => onToggleSymptom(symptom)}
                        />
                    ))}
                </View>
            </FormSection>

            {showPeriodSection ? (
                <FormSection title="Periodo">
                    <View style={styles.chips}>
                        <ChoiceChip active={periodStarted} label="Empezó hoy" onPress={onTogglePeriodStarted} />
                        <ChoiceChip active={periodEnded} label="Terminó hoy" onPress={onTogglePeriodEnded} />
                    </View>
                </FormSection>
            ) : null}

            <FormSection title="SPM">
                <View style={styles.chips}>
                    <ChoiceChip active={pmsStarted} label="Empezó hoy" onPress={onTogglePmsStarted} />
                </View>
            </FormSection>

            <FormSection title="Coágulos">
                <View style={styles.chips}>
                    {CLOT_SIZE_OPTIONS.map((item) => (
                        <ChoiceChip
                            active={clotSize === item.key}
                            key={item.key}
                            label={item.label}
                            onPress={() => onClotSizeChange(item.key)}
                        />
                    ))}
                </View>
            </FormSection>

            <FormSection title="¿Cuánto te frenó el dolor?">
                <View style={styles.chips}>
                    {PAIN_IMPACT_OPTIONS.map((item) => (
                        <ChoiceChip
                            active={painImpact === item.key}
                            key={item.key}
                            label={item.label}
                            onPress={() => onPainImpactChange(item.key)}
                        />
                    ))}
                </View>
            </FormSection>

            <FormSection title="Si tomaste algo">
                <TextInput
                    onChangeText={onMedicationNameChange}
                    placeholder="Ibuprofeno, naproxeno..."
                    placeholderTextColor={colors.muted}
                    style={styles.compactInput}
                    value={medicationName}
                />
                <View style={styles.chips}>
                    {MEDICATION_RELIEF_OPTIONS.map((item) => (
                        <ChoiceChip
                            active={medicationRelief === item.key}
                            key={item.key}
                            label={item.label}
                            onPress={() => onMedicationReliefChange(item.key)}
                        />
                    ))}
                </View>
            </FormSection>
        </>
    );
}
