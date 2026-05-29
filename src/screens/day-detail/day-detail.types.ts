import { Cycle } from "../../types/cycle.types";
import { DailyLog, MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

/** Props del screen de detalle por día seleccionado. */
export interface DayDetailScreenProps {
    selectedIso: string;
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    moodCheckIns: MoodCheckIn[];
    onBack: () => void;
    onOpenDiary: () => void;
}
