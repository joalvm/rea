import { Cycle } from "../../types/cycle.types";
import { DailyLog, MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

/** Props del screen de patrones e insights. */
export interface PatternsScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
}
