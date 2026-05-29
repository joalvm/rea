import { Cycle, CycleSnapshot } from "../../types/cycle.types";
import { DailyLog, MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

/** Props del screen principal de hoy. */
export interface TodayScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    snapshot: CycleSnapshot;
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
    onOpenCheckIn: () => void;
    onOpenDay: (iso: string) => void;
    onOpenQuickCheckIn: () => void;
    onOpenCalendar: () => void;
    onOpenPatterns: () => void;
    onOpenSettings: () => void;
}
