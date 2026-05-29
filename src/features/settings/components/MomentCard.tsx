import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import { colors } from "@/theme";
import { NotificationMoment } from "@/types/notifications.types";
import { SoftCard } from "@/ui/SoftCard";
import styles from "../ScheduleModal.styles";
import { ScheduleDayOption } from "../settings.types";
import momentIcon from "../utils/momentIcon";
import momentTone from "../utils/momentTone";

/** Props de una tarjeta editable de horario. */
interface ScheduleMomentCardProps {
    moment: NotificationMoment;
    days: ScheduleDayOption[];
    onUpdate: (id: string, patch: Partial<NotificationMoment>) => void;
    onRemove: (id: string) => void;
}

/** Renderiza y edita un horario individual de recordatorio. */
export default function MomentCard({ moment, days, onUpdate, onRemove }: ScheduleMomentCardProps) {
    const toggleDay = (day: number) => {
        const nextDays = moment.days.includes(day) ? moment.days.filter((item) => item !== day) : [...moment.days, day];
        onUpdate(moment.id, { days: nextDays });
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
                {days.map((day) => {
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
