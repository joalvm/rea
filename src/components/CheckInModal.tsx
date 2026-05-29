import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { toIsoDate } from "../modules/cycle/shared/cycleDate.utils";
import { colors, radii, type } from "../theme";
import {
    BleedingLevel,
    ClotSize,
    DailyLog,
    MedicationRelief,
    MomentType,
    MoodCheckIn,
    PainImpact,
} from "../types/records.types";
import { MetricScale } from "../ui/MetricScale";
import { SoftButton } from "../ui/SoftButton";

const SYMPTOMS = ["cólicos", "migraña", "acné", "hinchazón", "antojos", "insomnio", "náuseas"];

const BLEEDING: { key: BleedingLevel; label: string }[] = [
    { key: "none", label: "Nada" },
    { key: "spotting", label: "Manchado" },
    { key: "light", label: "Leve" },
    { key: "medium", label: "Medio" },
    { key: "heavy", label: "Abundante" },
];

const PAIN_IMPACT_OPTIONS: { key: PainImpact; label: string }[] = [
    { key: "none", label: "No frenó" },
    { key: "noticeable", label: "Se notó" },
    { key: "limits_day", label: "Me limitó" },
    { key: "stops_day", label: "Me tumbó" },
];

const MEDICATION_RELIEF_OPTIONS: { key: MedicationRelief; label: string }[] = [
    { key: "not_applicable", label: "No tomé" },
    { key: "helped", label: "Sí ayudó" },
    { key: "partly_helped", label: "Ayudó poco" },
    { key: "did_not_help", label: "No ayudó" },
];

const CLOT_SIZE_OPTIONS: { key: ClotSize; label: string }[] = [
    { key: "none", label: "No" },
    { key: "small", label: "Pequeños" },
    { key: "medium", label: "Medios" },
    { key: "large", label: "Grandes" },
];

interface CheckInModalProps {
    visible: boolean;
    mode: "daily" | "quick";
    momentType: MomentType;
    question: string;
    onClose: () => void;
    onDelete?: (checkIn?: MoodCheckIn | null) => Promise<void>;
    onSave: (checkIn?: MoodCheckIn, dailyLog?: DailyLog) => Promise<void>;
    initialCheckIn?: MoodCheckIn | null;
    initialDailyLog?: DailyLog | null;
    saveTarget?: "checkIn" | "dailyLog" | "both";
}

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
                      details: buildDailyLogDetails(),
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

    const buildDailyLogDetails = (): NonNullable<DailyLog["details"]> | null => {
        const details: NonNullable<DailyLog["details"]> = {};

        if (periodStarted) {
            details.periodStarted = true;
        }

        if (periodEnded) {
            details.periodEnded = true;
        }

        if (pmsStarted) {
            details.pmsStarted = true;
        }

        if (clotSize !== "none") {
            details.clotSize = clotSize;
        }

        if (painImpact !== "none") {
            details.painImpact = painImpact;
        }

        if (breastSensitivity > 0) {
            details.breastSensitivity = breastSensitivity;
        }

        const cleanMedicationName = medicationName.trim();
        if (cleanMedicationName) {
            details.medicationName = cleanMedicationName;
        }

        if (medicationRelief !== "not_applicable") {
            details.medicationRelief = medicationRelief;
        }

        return Object.keys(details).length > 0 ? details : null;
    };

    return (
        <Modal animationType="slide" statusBarTranslucent transparent visible={visible} onRequestClose={handleClose}>
            <View style={styles.scrim}>
                <Pressable style={styles.backdrop} onPress={handleClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
                    style={styles.keyboardLayer}
                >
                    <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <View style={styles.handle} />
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.kicker}>
                                    {isEditing ? "Editar registro" : mode === "daily" ? "Tu día" : "Un minuto para ti"}
                                </Text>
                                <Text style={styles.title}>{question}</Text>
                            </View>
                            <Pressable accessibilityRole="button" onPress={handleClose} style={styles.close}>
                                <MaterialCommunityIcons color={colors.primaryDeep} name="close" size={22} />
                            </Pressable>
                        </View>

                        <ScrollView
                            contentContainerStyle={[
                                styles.content,
                                { paddingBottom: 20 + Math.max(insets.bottom, 12) },
                            ]}
                            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {showCheckInMetrics ? (
                                <>
                                    <MetricScale
                                        highLabel="Muy bien"
                                        label="Ánimo"
                                        lowLabel="Bajo"
                                        onChange={setMood}
                                        value={mood}
                                    />
                                    <MetricScale
                                        highLabel="Alta"
                                        label="Energía"
                                        lowLabel="Baja"
                                        onChange={setEnergy}
                                        value={energy}
                                    />
                                    <MetricScale
                                        highLabel="Fuerte"
                                        label="Dolor"
                                        lowLabel="Nada"
                                        min={0}
                                        onChange={setPain}
                                        value={pain}
                                    />
                                    <MetricScale
                                        highLabel="Muy sensible"
                                        label="Sensibilidad mamaria"
                                        lowLabel="Nada"
                                        min={0}
                                        onChange={setBreastSensitivity}
                                        value={breastSensitivity}
                                    />
                                    <MetricScale
                                        highLabel="Alto"
                                        label="Estrés"
                                        lowLabel="Bajo"
                                        onChange={setStress}
                                        value={stress}
                                    />
                                </>
                            ) : null}

                            {showDailySections ? (
                                <>
                                    {!showCheckInMetrics ? (
                                        <MetricScale
                                            highLabel="Muy sensible"
                                            label="Sensibilidad mamaria"
                                            lowLabel="Nada"
                                            min={0}
                                            onChange={setBreastSensitivity}
                                            value={breastSensitivity}
                                        />
                                    ) : null}

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Sangrado</Text>
                                        <View style={styles.chips}>
                                            {BLEEDING.map((item) => (
                                                <Pressable
                                                    key={item.key}
                                                    onPress={() => setBleedingLevel(item.key)}
                                                    style={[
                                                        styles.chip,
                                                        bleedingLevel === item.key && styles.chipActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            bleedingLevel === item.key && styles.chipTextActive,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Síntomas</Text>
                                        <View style={styles.chips}>
                                            {SYMPTOMS.map((symptom) => {
                                                const active = symptoms.includes(symptom);
                                                return (
                                                    <Pressable
                                                        key={symptom}
                                                        onPress={() =>
                                                            setSymptoms((current) =>
                                                                current.includes(symptom)
                                                                    ? current.filter((item) => item !== symptom)
                                                                    : [...current, symptom],
                                                            )
                                                        }
                                                        style={[styles.chip, active && styles.chipActive]}
                                                    >
                                                        <Text
                                                            style={[styles.chipText, active && styles.chipTextActive]}
                                                        >
                                                            {symptom}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {showPeriodSection ? (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Periodo</Text>
                                            <View style={styles.chips}>
                                                <Pressable
                                                    onPress={() => setPeriodStarted((current) => !current)}
                                                    style={[styles.chip, periodStarted && styles.chipActive]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            periodStarted && styles.chipTextActive,
                                                        ]}
                                                    >
                                                        Empezó hoy
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => setPeriodEnded((current) => !current)}
                                                    style={[styles.chip, periodEnded && styles.chipActive]}
                                                >
                                                    <Text
                                                        style={[styles.chipText, periodEnded && styles.chipTextActive]}
                                                    >
                                                        Terminó hoy
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : null}

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>SPM</Text>
                                        <View style={styles.chips}>
                                            <Pressable
                                                onPress={() => setPmsStarted((current) => !current)}
                                                style={[styles.chip, pmsStarted && styles.chipActive]}
                                            >
                                                <Text style={[styles.chipText, pmsStarted && styles.chipTextActive]}>
                                                    Empezó hoy
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Coágulos</Text>
                                        <View style={styles.chips}>
                                            {CLOT_SIZE_OPTIONS.map((item) => (
                                                <Pressable
                                                    key={item.key}
                                                    onPress={() => setClotSize(item.key)}
                                                    style={[styles.chip, clotSize === item.key && styles.chipActive]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            clotSize === item.key && styles.chipTextActive,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>¿Cuánto te frenó el dolor?</Text>
                                        <View style={styles.chips}>
                                            {PAIN_IMPACT_OPTIONS.map((item) => (
                                                <Pressable
                                                    key={item.key}
                                                    onPress={() => setPainImpact(item.key)}
                                                    style={[styles.chip, painImpact === item.key && styles.chipActive]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            painImpact === item.key && styles.chipTextActive,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Si tomaste algo</Text>
                                        <TextInput
                                            onChangeText={setMedicationName}
                                            placeholder="Ibuprofeno, naproxeno..."
                                            placeholderTextColor={colors.muted}
                                            style={styles.compactInput}
                                            value={medicationName}
                                        />
                                        <View style={styles.chips}>
                                            {MEDICATION_RELIEF_OPTIONS.map((item) => (
                                                <Pressable
                                                    key={item.key}
                                                    onPress={() => setMedicationRelief(item.key)}
                                                    style={[
                                                        styles.chip,
                                                        medicationRelief === item.key && styles.chipActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            medicationRelief === item.key && styles.chipTextActive,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            ) : null}

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Nota opcional</Text>
                                <TextInput
                                    multiline
                                    onChangeText={setNote}
                                    placeholder="Algo que quieras recordar..."
                                    placeholderTextColor={colors.muted}
                                    style={styles.input}
                                    value={note}
                                />
                            </View>

                            <View style={styles.actionsRow}>
                                {canDeleteMoment ? (
                                    <SoftButton
                                        label="Eliminar momento"
                                        loading={deleting}
                                        onPress={confirmDeleteMoment}
                                        style={styles.deleteButton}
                                        variant="ghost"
                                        labelStyle={styles.deleteButtonLabel}
                                        loadingColor={colors.period}
                                    />
                                ) : null}
                                <SoftButton
                                    label={isEditing ? "Actualizar" : "Guardar"}
                                    loading={saving}
                                    onPress={submit}
                                    style={[styles.saveButton, canDeleteMoment ? styles.saveButtonSplit : null]}
                                />
                            </View>
                            {isEditing && initialDailyLog ? (
                                <Text style={styles.helperText}>
                                    Para quitar algo de este día, desmárcalo o borra su nota. Día completo no se
                                    elimina.
                                </Text>
                            ) : null}
                            <Text style={styles.privacy}>Se queda solo en este teléfono.</Text>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scrim: {
        flex: 1,
        backgroundColor: "rgba(27,44,51,0.28)",
        justifyContent: "flex-end",
    },
    keyboardLayer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheet: {
        maxHeight: "88%",
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        backgroundColor: colors.background,
        paddingTop: 10,
        paddingHorizontal: 18,
    },
    handle: {
        alignSelf: "center",
        width: 42,
        height: 5,
        borderRadius: 999,
        backgroundColor: "rgba(8, 124, 155, 0.22)",
        marginBottom: 14,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    title: {
        color: colors.ink,
        fontSize: type.title,
        fontWeight: "900",
        marginTop: 4,
    },
    close: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        gap: 22,
        paddingTop: 24,
        paddingBottom: 36,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 9,
    },
    chip: {
        minHeight: 40,
        borderRadius: radii.md,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.1)",
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    chipTextActive: {
        color: colors.primaryInk,
    },
    input: {
        minHeight: 96,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.1)",
        color: colors.ink,
        padding: 16,
        fontSize: type.body,
        textAlignVertical: "top",
    },
    compactInput: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.1)",
        color: colors.ink,
        paddingHorizontal: 16,
        fontSize: type.body,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
    },
    deleteButton: {
        flex: 1,
        borderColor: "rgba(219,79,102,0.24)",
        backgroundColor: colors.surface,
    },
    deleteButtonLabel: {
        color: colors.period,
    },
    saveButton: {
        width: "100%",
    },
    saveButtonSplit: {
        flex: 1,
        width: undefined,
    },
    helperText: {
        color: colors.muted,
        textAlign: "center",
        fontSize: type.small,
        lineHeight: 18,
        marginTop: -6,
    },
    privacy: {
        color: colors.muted,
        textAlign: "center",
        fontSize: type.small,
        lineHeight: 18,
    },
});
