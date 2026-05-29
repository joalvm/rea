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
