import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import styles from "./CheckInModal.styles";
import CheckInActionsRow from "./components/CheckInActionsRow";
import CheckInDailySections from "./components/CheckInDailySections";
import CheckInModalHeader from "./components/CheckInModalHeader";
import CheckInMetricsSection from "./components/CheckInMetricsSection";
import CheckInNoteSection from "./components/CheckInNoteSection";
import { CheckInModalProps } from "./check-in.types";
import useCheckInForm from "./hooks/useCheckInForm";

export function CheckInModal({
    visible,
    mode,
    momentType,
    question,
    onClose,
    onDelete,
    onSave,
    initialCheckIn = null,
    initialDailyLog = null,
    saveTarget = mode === "daily" ? "both" : "checkIn",
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
        saveTarget,
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
                            question={question}
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
                                    medicationName={form.medicationName}
                                    medicationRelief={form.medicationRelief}
                                    onBleedingLevelChange={form.setBleedingLevel}
                                    onBreastSensitivityChange={form.setBreastSensitivity}
                                    onClotSizeChange={form.setClotSize}
                                    onMedicationNameChange={form.setMedicationName}
                                    onMedicationReliefChange={form.setMedicationRelief}
                                    onPainImpactChange={form.setPainImpact}
                                    onTogglePeriodEnded={() => form.setPeriodEnded((current) => !current)}
                                    onTogglePeriodStarted={() => form.setPeriodStarted((current) => !current)}
                                    onTogglePmsStarted={() => form.setPmsStarted((current) => !current)}
                                    onToggleSymptom={form.toggleSymptom}
                                    painImpact={form.painImpact}
                                    periodEnded={form.periodEnded}
                                    periodStarted={form.periodStarted}
                                    pmsStarted={form.pmsStarted}
                                    showPeriodSection={form.showPeriodSection}
                                    showStandaloneBreastSensitivity={!form.showCheckInMetrics}
                                    symptoms={form.symptoms}
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
