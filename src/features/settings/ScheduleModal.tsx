import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colors } from "@/theme";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { NotificationMoment } from "@/types/notifications.types";
import { SoftButton } from "@/ui/SoftButton";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./ScheduleModal.styles";
import MomentCard from "./components/MomentCard";
import { ScheduleDayOption } from "./settings.types";

/** Props del modal de horarios de recordatorio. */
interface ScheduleModalProps {
    visible: boolean;
    moments: NotificationMoment[];
    onClose: () => void;
    onChange: (moments: NotificationMoment[]) => Promise<void>;
}

const DAYS: ScheduleDayOption[] = [
    { key: 1, label: "L" },
    { key: 2, label: "M" },
    { key: 3, label: "M" },
    { key: 4, label: "J" },
    { key: 5, label: "V" },
    { key: 6, label: "S" },
    { key: 0, label: "D" },
];

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
                    <ScreenHeader
                        kicker="Momentos del día"
                        leading={
                            <Pressable accessibilityRole="button" onPress={onClose} style={styles.iconButton}>
                                <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={26} />
                            </Pressable>
                        }
                        subtitle="Elige horarios cómodos. En pantalla bloqueada solo verás preguntas suaves."
                        title="Cuándo quieres que te pregunte"
                    />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {moments.map((moment) => (
                        <MomentCard
                            days={DAYS}
                            key={moment.id}
                            moment={moment}
                            onRemove={removeMoment}
                            onUpdate={updateMoment}
                        />
                    ))}

                    <SoftCard style={styles.addCard} tone="primary" variant="soft">
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
