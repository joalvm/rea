import { ScrollView, Text, View } from "react-native";

import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftButton } from "@/ui/SoftButton";
import styles from "./DiaryScreen.styles";
import CheckInRow from "./components/CheckInRow";
import DailyLogRow from "./components/DailyLogRow";
import DiaryEmptyState from "./components/DiaryEmptyState";

/** Props del screen de diario y edición de registros. */
interface DiaryScreenProps {
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onOpenCheckIn: () => void;
    onOpenQuickCheckIn: () => void;
    onEditCheckIn: (entry: MoodCheckIn) => void;
    onEditDailyLog: (entry: DailyLog) => void;
}

export function DiaryScreen({
    dailyLogs,
    moodCheckIns,
    onOpenCheckIn,
    onOpenQuickCheckIn,
    onEditCheckIn,
    onEditDailyLog,
}: DiaryScreenProps) {
    const latest = moodCheckIns.slice(0, 12);

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader
                kicker="Diario privado"
                subtitle="Mañana, noche y momentos sueltos se guardan separados para que tengan sentido después."
                title="Tus registros, sin ruido."
            />

            <View style={styles.actions}>
                <SoftButton label="Mi día" onPress={onOpenCheckIn} style={styles.actionButton} />
                <SoftButton
                    label="Ahora"
                    onPress={onOpenQuickCheckIn}
                    style={styles.actionButton}
                    variant="secondary"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Últimos momentos</Text>
                {latest.length === 0 ? (
                    <DiaryEmptyState />
                ) : (
                    latest.map((item) => (
                        <CheckInRow item={item} key={item.id ?? item.datetime} onEdit={() => onEditCheckIn(item)} />
                    ))
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Días con registro completo</Text>
                {dailyLogs.length === 0 ? (
                    <DiaryEmptyState label="Aún no hay días completos. El primero tarda menos de un minuto." />
                ) : (
                    dailyLogs.map((log) => <DailyLogRow key={log.date} log={log} onEdit={() => onEditDailyLog(log)} />)
                )}
            </View>
        </ScrollView>
    );
}
