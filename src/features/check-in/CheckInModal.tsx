import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckInPromptContext } from "@/app/app-shell.types";
import styles from "./CheckInModal.styles";
import CheckInActionsRow from "./components/CheckInActionsRow";
import CheckInDailySections from "./components/CheckInDailySections";
import CheckInModalHeader from "./components/CheckInModalHeader";
import CheckInMetricsSection from "./components/CheckInMetricsSection";
import CheckInNoteSection from "./components/CheckInNoteSection";
import { CheckInMode, CheckInSubmission } from "./check-in.types";
import useCheckInForm from "./hooks/useCheckInForm";

import { DailyLog, MomentType, MoodCheckIn } from "@/types/records.types";

/** Props del modal de check-in diario o puntual. */
interface CheckInModalProps {
    visible: boolean;
    mode: CheckInMode;
    momentType: MomentType;
    promptContext: CheckInPromptContext;
    onClose: () => void;
    onDelete?: (checkIn?: MoodCheckIn | null) => Promise<void>;
    onSave: (submission: CheckInSubmission) => Promise<void>;
    initialCheckIn?: MoodCheckIn | null;
    initialDailyLog?: DailyLog | null;
    dailyLogOnly?: boolean;
}

export function CheckInModal({
    visible,
    mode,
    momentType,
    promptContext,
    onClose,
    onDelete,
    onSave,
    initialCheckIn = null,
    initialDailyLog = null,
    dailyLogOnly = false,
}: CheckInModalProps) {
    const insets = useSafeAreaInsets();
    const form = useCheckInForm({
        mode,
        momentType,
        onClose,
        onDelete,
        onSave,
        initialCheckIn,
        initialDailyLog,
        dailyLogOnly,
    });

    return (
        <Modal
            animationType="slide"
            statusBarTranslucent
            transparent
            visible={visible}
            onRequestClose={form.handleClose}
        >
            <View style={styles.scrim}>
                <Pressable style={styles.backdrop} onPress={form.handleClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
                    style={styles.keyboardLayer}
                >
                    <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <View style={styles.handle} />
                        <CheckInModalHeader
                            isEditing={form.isEditing}
                            mode={mode}
                            onClose={form.handleClose}
                            promptContext={promptContext}
                        />

                        <ScrollView
                            contentContainerStyle={[
                                styles.content,
                                { paddingBottom: 20 + Math.max(insets.bottom, 12) },
                            ]}
                            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {form.showCheckInMetrics ? (
                                <CheckInMetricsSection
                                    breastSensitivity={form.breastSensitivity}
                                    energy={form.energy}
                                    mood={form.mood}
                                    onBreastSensitivityChange={form.setBreastSensitivity}
                                    onEnergyChange={form.setEnergy}
                                    onMoodChange={form.setMood}
                                    onPainChange={form.setPain}
                                    onStressChange={form.setStress}
                                    pain={form.pain}
                                    stress={form.stress}
                                />
                            ) : null}

                            {form.showDailySections ? (
                                <CheckInDailySections
                                    bleedingLevel={form.bleedingLevel}
                                    breastSensitivity={form.breastSensitivity}
                                    clotSize={form.clotSize}
                                    libidoLevel={form.libidoLevel}
                                    medicationName={form.medicationName}
                                    medicationRelief={form.medicationRelief}
                                    onBleedingLevelChange={form.setBleedingLevel}
                                    onBreastSensitivityChange={form.setBreastSensitivity}
                                    onClotSizeChange={form.setClotSize}
                                    onLibidoLevelChange={form.setLibidoLevel}
                                    onMedicationNameChange={form.setMedicationName}
                                    onMedicationReliefChange={form.setMedicationRelief}
                                    onPainImpactChange={form.setPainImpact}
                                    onPmsStateChange={form.setPmsState}
                                    onSymptomIntensityChange={form.setSymptomIntensity}
                                    onTogglePainLocation={form.togglePainLocation}
                                    onTogglePeriodEnded={() => form.setPeriodEnded((current) => !current)}
                                    onTogglePeriodStarted={() => form.setPeriodStarted((current) => !current)}
                                    onToggleSymptom={form.toggleSymptom}
                                    pain={form.pain}
                                    painImpact={form.painImpact}
                                    painLocations={form.painLocations}
                                    periodEnded={form.periodEnded}
                                    periodStarted={form.periodStarted}
                                    pmsState={form.pmsState}
                                    showPeriodSection={form.showPeriodSection}
                                    showStandaloneBreastSensitivity={!form.showCheckInMetrics}
                                    symptoms={form.symptoms}
                                    symptomIntensities={form.symptomIntensities}
                                />
                            ) : null}

                            <CheckInNoteSection note={form.note} onChangeNote={form.setNote} />
                            <CheckInActionsRow
                                canDeleteMoment={form.canDeleteMoment}
                                deleting={form.deleting}
                                isEditing={form.isEditing}
                                onDelete={form.confirmDeleteMoment}
                                onSave={form.submit}
                                saving={form.saving}
                                showDailyLogHelper={Boolean(form.isEditing && initialDailyLog)}
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
