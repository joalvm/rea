import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import notificationCadenceSummary from "@/modules/notifications/utils/notificationCadenceSummary";
import { colors } from "@/theme";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { NotificationCadence } from "@/types/notifications.types";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./ScheduleModal.styles";

/** Props del modal de horarios de recordatorio. */
interface ScheduleModalProps {
    visible: boolean;
    cadence: NotificationCadence;
    onClose: () => void;
    onChange: (cadence: NotificationCadence) => Promise<void>;
}

const INTERVAL_OPTIONS = [4, 6, 8, 12, 24];
const MAX_PROMPTS_OPTIONS = [1, 2, 3, 4];

export function ScheduleModal({ visible, cadence, onClose, onChange }: ScheduleModalProps) {
    const { t } = useTranslation("settings");
    const [draft, setDraft] = useState(cadence);

    const summary = useMemo(() => notificationCadenceSummary(draft), [draft]);

    const commit = async (next: NotificationCadence) => {
        setDraft(next);
        await onChange(next);
    };

    const updateDraft = (patch: Partial<NotificationCadence>) => {
        const next = { ...draft, ...patch };
        void commit(next);
    };

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <ScreenHeader
                        kicker={t("schedule.cadenceKicker")}
                        leading={
                            <Pressable accessibilityRole="button" onPress={onClose} style={styles.iconButton}>
                                <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={26} />
                            </Pressable>
                        }
                        subtitle={t("schedule.subtitle")}
                        title={t("schedule.title")}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <SoftCard style={styles.momentCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.momentTitleRow}>
                                <View style={[styles.momentIcon, { backgroundColor: "rgba(8, 124, 155, 0.12)" }]}>
                                    <MaterialCommunityIcons color={colors.primaryDeep} name="bell-outline" size={23} />
                                </View>
                                <View style={styles.momentCopy}>
                                    <Text style={styles.cardTitle}>{t("schedule.cardTitle")}</Text>
                                    <Text style={styles.question}>{summary}</Text>
                                </View>
                            </View>
                            <Switch
                                onValueChange={(enabled) => updateDraft({ enabled })}
                                thumbColor={draft.enabled ? colors.primaryDeep : colors.surface}
                                trackColor={{ false: "rgba(122,139,146,0.22)", true: colors.primary }}
                                value={draft.enabled}
                            />
                        </View>
                    </SoftCard>

                    <SoftCard style={styles.addCard} tone="primary" variant="soft">
                        <Text style={styles.cardTitle}>{t("schedule.intervalTitle")}</Text>
                        <View style={styles.days}>
                            {INTERVAL_OPTIONS.map((hours) => {
                                const active = draft.intervalHours === hours;
                                return (
                                    <Pressable
                                        key={`interval-${hours}`}
                                        onPress={() => updateDraft({ intervalHours: hours })}
                                        style={[styles.day, active && styles.dayActive]}
                                    >
                                        <Text style={[styles.dayText, active && styles.dayTextActive]}>
                                            {hours} {t("common:units.hourShort")}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </SoftCard>

                    <SoftCard style={styles.addCard} tone="primary" variant="soft">
                        <Text style={styles.cardTitle}>{t("schedule.windowTitle")}</Text>
                        <TextInput
                            keyboardType="numbers-and-punctuation"
                            onChangeText={(value) => setDraft((current) => ({ ...current, activeWindowStart: value }))}
                            onEndEditing={() => updateDraft({ activeWindowStart: draft.activeWindowStart })}
                            placeholder={t("schedule.windowStartPlaceholder")}
                            placeholderTextColor={colors.muted}
                            style={styles.input}
                            value={draft.activeWindowStart}
                        />
                        <TextInput
                            keyboardType="numbers-and-punctuation"
                            onChangeText={(value) => setDraft((current) => ({ ...current, activeWindowEnd: value }))}
                            onEndEditing={() => updateDraft({ activeWindowEnd: draft.activeWindowEnd })}
                            placeholder={t("schedule.windowEndPlaceholder")}
                            placeholderTextColor={colors.muted}
                            style={styles.input}
                            value={draft.activeWindowEnd}
                        />
                    </SoftCard>

                    <SoftCard style={styles.addCard} tone="primary" variant="soft">
                        <Text style={styles.cardTitle}>{t("schedule.maxPerDayTitle")}</Text>
                        <View style={styles.days}>
                            {MAX_PROMPTS_OPTIONS.map((count) => {
                                const active = draft.maxPromptsPerDay === count;
                                return (
                                    <Pressable
                                        key={`daily-${count}`}
                                        onPress={() => updateDraft({ maxPromptsPerDay: count })}
                                        style={[styles.day, active && styles.dayActive]}
                                    >
                                        <Text style={[styles.dayText, active && styles.dayTextActive]}>{count}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        <Text style={styles.question}>{t("schedule.snoozeText")}</Text>
                    </SoftCard>
                </ScrollView>
            </View>
        </Modal>
    );
}
