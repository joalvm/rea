import { useState } from "react";
import { Alert } from "react-native";

import { translate } from "@/modules/localization/i18n";
import { normalizeSymptomKeys } from "@/modules/cycle/utils/symptomCatalog";
import { toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import {
    BleedingLevel,
    ClotSize,
    DailyLog,
    LibidoLevel,
    MedicationRelief,
    MoodCheckIn,
    PainLocation,
    PainImpact,
    PmsState,
    SymptomKey,
} from "@/types/records.types";
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
    dailyLogOnly = false,
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
    const [symptoms, setSymptoms] = useState<SymptomKey[]>(normalizeSymptomKeys(initialDailyLog?.symptoms ?? []));
    const [periodStarted, setPeriodStarted] = useState(Boolean(initialDailyLog?.details?.periodStarted));
    const [periodEnded, setPeriodEnded] = useState(Boolean(initialDailyLog?.details?.periodEnded));
    const [pmsState, setPmsState] = useState<PmsState>(
        initialDailyLog?.details?.pmsState ?? (initialDailyLog?.details?.pmsStarted ? "starting" : "none"),
    );
    const [clotSize, setClotSize] = useState<ClotSize>(initialDailyLog?.details?.clotSize ?? "none");
    const [painImpact, setPainImpact] = useState<PainImpact>(initialDailyLog?.details?.painImpact ?? "none");
    const [painLocations, setPainLocations] = useState<PainLocation[]>(initialDailyLog?.details?.painLocations ?? []);
    const [symptomIntensities, setSymptomIntensities] = useState<Partial<Record<SymptomKey, number>>>(
        initialDailyLog?.details?.symptomIntensities ?? {},
    );
    const [libidoLevel, setLibidoLevel] = useState<LibidoLevel>(initialDailyLog?.details?.libidoLevel ?? "steady");
    const [medicationName, setMedicationName] = useState(initialDailyLog?.details?.medicationName ?? "");
    const [medicationRelief, setMedicationRelief] = useState<MedicationRelief>(
        initialDailyLog?.details?.medicationRelief ?? "not_applicable",
    );
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    const isEditing = Boolean(initialCheckIn || initialDailyLog);
    const showCheckInMetrics = !dailyLogOnly;
    const showDailySections = true;
    const showPeriodSection = !dailyLogOnly;
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

        Alert.alert(translate("checkIn:alerts.deleteMoment.title"), translate("checkIn:alerts.deleteMoment.body"), [
            { text: translate("common:actions.cancel"), style: "cancel" },
            {
                text: translate("checkIn:alerts.deleteMoment.confirm"),
                style: "destructive",
                onPress: () => {
                    void destroyMoment();
                },
            },
        ]);
    };

    const toggleSymptom = (symptom: SymptomKey) => {
        setSymptoms((current) => {
            if (current.includes(symptom)) {
                setSymptomIntensities((values) => {
                    const next = { ...values };
                    delete next[symptom];
                    return next;
                });
                return current.filter((item) => item !== symptom);
            }

            setSymptomIntensities((values) => ({ ...values, [symptom]: values[symptom] ?? 3 }));
            return [...current, symptom];
        });
    };

    const setSymptomIntensity = (symptom: SymptomKey, value: number) => {
        setSymptomIntensities((current) => ({ ...current, [symptom]: value }));
    };

    const togglePainLocation = (location: PainLocation) => {
        setPainLocations((current) =>
            current.includes(location) ? current.filter((item) => item !== location) : [...current, location],
        );
    };

    const submit = async () => {
        const now = new Date();
        const trimmedNote = note.trim() || null;
        const dailyLogDetails = buildDailyLogDetails({
            periodStarted,
            periodEnded,
            pmsState,
            clotSize,
            painImpact,
            painLocations,
            symptomIntensities,
            libidoLevel,
            breastSensitivity,
            medicationName,
            medicationRelief,
        });
        const shouldPersistDailyLog =
            dailyLogOnly ||
            mode === "daily" ||
            Boolean(initialDailyLog) ||
            bleedingLevel !== "none" ||
            symptoms.length > 0 ||
            Boolean(dailyLogDetails);
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
            showDailySections && shouldPersistDailyLog
                ? {
                      date: initialDailyLog?.date ?? toIsoDate(now),
                      bleedingLevel,
                      symptoms,
                      notes: trimmedNote,
                      source: initialDailyLog?.source ?? "observed",
                      details: dailyLogDetails,
                      updatedAt: now.toISOString(),
                  }
                : undefined;

        setSaving(true);
        try {
            await onSave({ moodCheckIn: checkIn, dailyLog });
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
        symptomIntensities,
        setSymptomIntensity,
        periodStarted,
        setPeriodStarted,
        periodEnded,
        setPeriodEnded,
        pmsState,
        setPmsState,
        clotSize,
        setClotSize,
        painImpact,
        setPainImpact,
        painLocations,
        togglePainLocation,
        libidoLevel,
        setLibidoLevel,
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
