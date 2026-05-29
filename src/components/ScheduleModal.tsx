import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { colors, radii, type } from "../theme";
import { NotificationMoment } from "../types/notifications.types";
import { MomentType } from "../types/records.types";
import { SoftButton } from "../ui/SoftButton";
import { SoftCard } from "../ui/SoftCard";

const DAYS = [
    { key: 1, label: "L" },
    { key: 2, label: "M" },
    { key: 3, label: "M" },
    { key: 4, label: "J" },
    { key: 5, label: "V" },
    { key: 6, label: "S" },
    { key: 0, label: "D" },
];

interface ScheduleModalProps {
    visible: boolean;
    moments: NotificationMoment[];
    onClose: () => void;
    onChange: (moments: NotificationMoment[]) => Promise<void>;
}

export function ScheduleModal({ visible, moments, onClose, onChange }: ScheduleModalProps) {
    const [label, setLabel] = useState("Tarde");
    const [time, setTime] = useState("16:30");
    const [saving, setSaving] = useState(false);

    const commit = async (next: NotificationMoment[]) => {
        setSaving(true);
        try {
            await onChange(next);
        } finally {
            setSaving(false);
        }
    };

    const updateMoment = (id: string, patch: Partial<NotificationMoment>) => {
        void commit(moments.map((moment) => (moment.id === id ? { ...moment, ...patch } : moment)));
    };

    const removeMoment = (id: string) => {
        void commit(moments.filter((moment) => moment.id !== id));
    };

    const addCustom = () => {
        const cleanLabel = label.trim() || "Momento";
        const id = `custom-${Date.now()}`;
        const next: NotificationMoment = {
            id,
            label: cleanLabel,
            time,
            enabled: true,
            days: [1, 2, 3, 4, 5],
            type: "custom",
            question: "¿Cómo te sientes ahora?",
            notificationIds: [],
        };
        setLabel("Tarde");
        setTime("16:30");
        void commit([...moments, next]);
    };

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <Pressable accessibilityRole="button" onPress={onClose} style={styles.iconButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={26} />
                    </Pressable>
                    <View style={styles.headerText}>
                        <Text style={styles.kicker}>Momentos del día</Text>
                        <Text style={styles.title}>Cuándo quieres que te pregunte</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.helper}>
                        Elige horarios cómodos. En pantalla bloqueada solo verás preguntas suaves.
                    </Text>

                    {moments.map((moment) => (
                        <MomentCard key={moment.id} moment={moment} onRemove={removeMoment} onUpdate={updateMoment} />
                    ))}

                    <SoftCard style={styles.addCard}>
                        <Text style={styles.cardTitle}>Añadir otro momento</Text>
                        <TextInput
                            onChangeText={setLabel}
                            placeholder="Nombre"
                            placeholderTextColor={colors.muted}
                            style={styles.input}
                            value={label}
                        />
                        <TextInput
                            keyboardType="numbers-and-punctuation"
                            onChangeText={setTime}
                            placeholder="16:30"
                            placeholderTextColor={colors.muted}
                            style={styles.input}
                            value={time}
                        />
                        <SoftButton disabled={saving} label="Añadir momento" onPress={addCustom} variant="secondary" />
                    </SoftCard>
                </ScrollView>
            </View>
        </Modal>
    );
}

interface MomentCardProps {
    moment: NotificationMoment;
    onUpdate: (id: string, patch: Partial<NotificationMoment>) => void;
    onRemove: (id: string) => void;
}

function MomentCard({ moment, onUpdate, onRemove }: MomentCardProps) {
    const toggleDay = (day: number) => {
        const days = moment.days.includes(day) ? moment.days.filter((item) => item !== day) : [...moment.days, day];
        onUpdate(moment.id, { days });
    };

    return (
        <SoftCard style={styles.momentCard}>
            <View style={styles.cardHeader}>
                <View style={styles.momentTitleRow}>
                    <View style={[styles.momentIcon, { backgroundColor: momentTone(moment.type).background }]}>
                        <MaterialCommunityIcons
                            color={momentTone(moment.type).color}
                            name={momentIcon(moment.type) as never}
                            size={23}
                        />
                    </View>
                    <View style={styles.momentCopy}>
                        <Text style={styles.cardTitle}>{moment.label}</Text>
                        <Text style={styles.question}>{moment.question}</Text>
                    </View>
                </View>
                <Switch
                    onValueChange={(enabled) => onUpdate(moment.id, { enabled })}
                    thumbColor={moment.enabled ? colors.primaryDeep : colors.surface}
                    trackColor={{ false: "rgba(122,139,146,0.22)", true: colors.primary }}
                    value={moment.enabled}
                />
            </View>

            <TextInput
                keyboardType="numbers-and-punctuation"
                onChangeText={(value) => onUpdate(moment.id, { time: value })}
                style={styles.timeInput}
                value={moment.time}
            />

            <View style={styles.days}>
                {DAYS.map((day) => {
                    const active = moment.days.includes(day.key);
                    return (
                        <Pressable
                            key={`${moment.id}-${day.key}`}
                            onPress={() => toggleDay(day.key)}
                            style={[styles.day, active && styles.dayActive]}
                        >
                            <Text style={[styles.dayText, active && styles.dayTextActive]}>{day.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {moment.type === "custom" ? (
                <Pressable accessibilityRole="button" onPress={() => onRemove(moment.id)} style={styles.remove}>
                    <MaterialCommunityIcons color={colors.danger} name="trash-can-outline" size={18} />
                    <Text style={styles.removeText}>Eliminar</Text>
                </Pressable>
            ) : null}
        </SoftCard>
    );
}

function momentIcon(type: MomentType) {
    if (type === "morning") return "weather-sunset-up";
    if (type === "night") return "weather-night";
    return "heart-pulse";
}

function momentTone(type: MomentType) {
    if (type === "morning") return { color: colors.primaryDeep, background: colors.primarySoft };
    if (type === "night") return { color: "#7A5EC9", background: colors.lutealSoft };
    return { color: colors.period, background: colors.periodSoft };
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 52,
    },
    header: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primarySoft,
    },
    headerText: {
        flex: 1,
        minWidth: 0,
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
        lineHeight: 28,
        flexShrink: 1,
    },
    content: {
        gap: 16,
        padding: 18,
        paddingBottom: 36,
    },
    helper: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
        paddingHorizontal: 2,
    },
    momentCard: {
        gap: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    momentTitleRow: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    momentIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
    },
    momentCopy: {
        flex: 1,
        minWidth: 0,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    question: {
        color: colors.muted,
        fontSize: type.small,
        marginTop: 4,
        lineHeight: 17,
    },
    timeInput: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        color: colors.ink,
        paddingHorizontal: 16,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    days: {
        flexDirection: "row",
        gap: 8,
    },
    day: {
        flex: 1,
        minHeight: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceSoft,
    },
    dayActive: {
        backgroundColor: colors.primary,
    },
    dayText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    dayTextActive: {
        color: colors.primaryInk,
    },
    remove: {
        alignSelf: "flex-start",
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
    },
    removeText: {
        color: colors.danger,
        fontSize: type.small,
        fontWeight: "800",
    },
    addCard: {
        gap: 12,
    },
    input: {
        minHeight: 48,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        color: colors.ink,
        paddingHorizontal: 16,
        fontSize: type.body,
    },
});
