import { DailyLog, MoodCheckIn } from "../../types/records.types";

/** Props del screen de diario y edición de registros. */
export interface DiaryScreenProps {
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onOpenCheckIn: () => void;
    onOpenQuickCheckIn: () => void;
    onEditCheckIn: (entry: MoodCheckIn) => void;
    onEditDailyLog: (entry: DailyLog) => void;
}

/** Props de una fila de check-in puntual. */
export interface DiaryCheckInRowProps {
    item: MoodCheckIn;
    onEdit: () => void;
}

/** Props de una fila de día con registro completo. */
export interface DiaryDailyLogRowProps {
    log: DailyLog;
    onEdit: () => void;
}

/** Props de la tarjeta de estado vacío del diario. */
export interface DiaryEmptyStateProps {
    label?: string;
}

/** Props de una métrica compacta en filas del diario. */
export interface DiaryMetricProps {
    label: string;
    value: number;
}
