import { useState } from "react";
import { Alert } from "react-native";

import { toIsoDate } from "@/modules/cycle/shared/cycleDate.utils";
import { BleedingLevel, ClotSize, DailyLog, MedicationRelief, MoodCheckIn, PainImpact } from "@/types/records.types";
import { CheckInFormConfig } from "../check-in.types";
import buildDailyLogDetails from "../utils/buildDailyLogDetails";

/** Controla estado, acciones y payloads del modal de check-in. */
export default function useCheckInForm({
    mode,
    momentType,
    onClose,
    onDelete,
    onSave,
    initialCheckIn = null,
    initialDailyLog = null,
    saveTarget,
}: CheckInFormConfig) {
    const [mood, setMood] = useState(initialCheckIn?.mood ?? 3);
    const [energy, setEnergy] = useState(initialCheckIn?.energy ?? 3);
    const [pain, setPain] = useState(initialCheckIn?.pain ?? 0);
    const [breastSensitivity, setBreastSensitivity] = useState(
        initialCheckIn?.breastSensitivity ?? initialDailyLog?.details?.breastSensitivity ?? 0,
    );
    const [stress, setStress] = useState(initialCheckIn?.stress ?? 2);
    const [note, setNote] = useState(initialCheckIn?.note ?? initialDailyLog?.notes ?? "");
    const [bleedingLevel, setBleedingLevel] = useState<BleedingLevel>(initialDailyLog?.bleedingLevel ?? "none");
    const [symptoms, setSymptoms] = useState<string[]>(initialDailyLog?.symptoms ?? []);
    const [periodStarted, setPeriodStarted] = useState(Boolean(initialDailyLog?.details?.periodStarted));
    const [periodEnded, setPeriodEnded] = useState(Boolean(initialDailyLog?.details?.periodEnded));
    const [pmsStarted, setPmsStarted] = useState(Boolean(initialDailyLog?.details?.pmsStarted));
    const [clotSize, setClotSize] = useState<ClotSize>(initialDailyLog?.details?.clotSize ?? "none");
    const [painImpact, setPainImpact] = useState<PainImpact>(initialDailyLog?.details?.painImpact ?? "none");
    const [medicationName, setMedicationName] = useState(initialDailyLog?.details?.medicationName ?? "");
    const [medicationRelief, setMedicationRelief] = useState<MedicationRelief>(
        initialDailyLog?.details?.medicationRelief ?? "not_applicable",
    );
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    const isEditing = Boolean(initialCheckIn || initialDailyLog);
    const showCheckInMetrics = saveTarget !== "dailyLog";
    const showDailySections = mode === "daily";
    const showPeriodSection = showDailySections && saveTarget === "both";
    const canDeleteMoment = Boolean(initialCheckIn?.id && onDelete);

    const handleClose = () => {
        onClose();
    };

    const destroyMoment = async () => {
        if (!initialCheckIn?.id || !onDelete) {
            return;
        }

        setDeleting(true);
        try {
            await onDelete(initialCheckIn);
            handleClose();
        } finally {
            setDeleting(false);
        }
    };

    const confirmDeleteMoment = () => {
        if (!initialCheckIn?.id || !onDelete) {
            return;
        }

        Alert.alert("Eliminar momento", "Se borrará solo esta anotación puntual. Día seguirá intacto.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: () => {
                    void destroyMoment();
                },
            },
        ]);
    };

    const toggleSymptom = (symptom: string) => {
        setSymptoms((current) =>
            current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom],
        );
    };

    const submit = async () => {
        const now = new Date();
        const trimmedNote = note.trim() || null;
        const checkIn: MoodCheckIn | undefined = showCheckInMetrics
            ? {
                  id: initialCheckIn?.id,
                  datetime: initialCheckIn?.datetime ?? now.toISOString(),
                  momentType: initialCheckIn?.momentType ?? momentType,
                  mood,
                  energy,
                  pain,
                  breastSensitivity,
                  stress,
                  note: trimmedNote,
              }
            : undefined;
        const dailyLog: DailyLog | undefined =
            showDailySections && saveTarget !== "checkIn"
                ? {
                      date: initialDailyLog?.date ?? toIsoDate(now),
                      bleedingLevel,
                      symptoms,
                      notes: trimmedNote,
                      source: initialDailyLog?.source ?? "observed",
                      details: buildDailyLogDetails({
                          periodStarted,
                          periodEnded,
                          pmsStarted,
                          clotSize,
                          painImpact,
                          breastSensitivity,
                          medicationName,
                          medicationRelief,
                      }),
                      updatedAt: now.toISOString(),
                  }
                : undefined;

        setSaving(true);
        try {
            await onSave(checkIn, dailyLog);
            handleClose();
        } finally {
            setSaving(false);
        }
    };

    return {
        mood,
        setMood,
        energy,
        setEnergy,
        pain,
        setPain,
        breastSensitivity,
        setBreastSensitivity,
        stress,
        setStress,
        note,
        setNote,
        bleedingLevel,
        setBleedingLevel,
        symptoms,
        periodStarted,
        setPeriodStarted,
        periodEnded,
        setPeriodEnded,
        pmsStarted,
        setPmsStarted,
        clotSize,
        setClotSize,
        painImpact,
        setPainImpact,
        medicationName,
        setMedicationName,
        medicationRelief,
        setMedicationRelief,
        deleting,
        saving,
        isEditing,
        showCheckInMetrics,
        showDailySections,
        showPeriodSection,
        canDeleteMoment,
        handleClose,
        confirmDeleteMoment,
        toggleSymptom,
        submit,
    };
}
