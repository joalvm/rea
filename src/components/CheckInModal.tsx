import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { toIsoDate } from "../cycle";
import { colors, radii, type } from "../theme";
import { BleedingLevel, DailyLog, MomentType, MoodCheckIn } from "../types";
import { MetricScale } from "./MetricScale";
import { SoftButton } from "./SoftButton";

const SYMPTOMS = ["cólicos", "migraña", "acné", "hinchazón", "sensibilidad", "antojos", "insomnio", "náuseas"];

const BLEEDING: { key: BleedingLevel; label: string }[] = [
    { key: "none", label: "Nada" },
    { key: "spotting", label: "Manchado" },
    { key: "light", label: "Leve" },
    { key: "medium", label: "Medio" },
    { key: "heavy", label: "Abundante" },
];

interface CheckInModalProps {
    visible: boolean;
    mode: "daily" | "quick";
    momentType: MomentType;
    question: string;
    onClose: () => void;
    onSave: (checkIn: MoodCheckIn, dailyLog?: DailyLog) => Promise<void>;
}

export function CheckInModal({ visible, mode, momentType, question, onClose, onSave }: CheckInModalProps) {
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [pain, setPain] = useState(1);
    const [stress, setStress] = useState(2);
    const [note, setNote] = useState("");
    const [bleedingLevel, setBleedingLevel] = useState<BleedingLevel>("none");
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const resetForm = () => {
        setMood(3);
        setEnergy(3);
        setPain(1);
        setStress(2);
        setNote("");
        setBleedingLevel("none");
        setSymptoms([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const submit = async () => {
        const now = new Date();
        const checkIn: MoodCheckIn = {
            datetime: now.toISOString(),
            momentType,
            mood,
            energy,
            pain,
            stress,
            note: note.trim() || null,
        };
        const dailyLog: DailyLog | undefined =
            mode === "daily"
                ? {
                      date: toIsoDate(now),
                      bleedingLevel,
                      symptoms,
                      notes: note.trim() || null,
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

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
            <View style={styles.scrim}>
                <Pressable style={styles.backdrop} onPress={handleClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.kicker}>{mode === "daily" ? "Tu día" : "Un minuto para ti"}</Text>
                            <Text style={styles.title}>{question}</Text>
                        </View>
                        <Pressable accessibilityRole="button" onPress={handleClose} style={styles.close}>
                            <MaterialCommunityIcons color={colors.primaryDeep} name="close" size={22} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                        <MetricScale highLabel="Fuerte" label="Dolor" lowLabel="Nada" onChange={setPain} value={pain} />
                        <MetricScale
                            highLabel="Alto"
                            label="Estrés"
                            lowLabel="Bajo"
                            onChange={setStress}
                            value={stress}
                        />

                        {mode === "daily" ? (
                            <>
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Sangrado</Text>
                                    <View style={styles.chips}>
                                        {BLEEDING.map((item) => (
                                            <Pressable
                                                key={item.key}
                                                onPress={() => setBleedingLevel(item.key)}
                                                style={[styles.chip, bleedingLevel === item.key && styles.chipActive]}
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
                                                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                                        {symptom}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
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

                        <SoftButton label="Guardar" loading={saving} onPress={submit} />
                        <Text style={styles.privacy}>Se queda solo en este teléfono.</Text>
                    </ScrollView>
                </View>
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
    privacy: {
        color: colors.muted,
        textAlign: "center",
        fontSize: type.small,
        lineHeight: 18,
    },
});
