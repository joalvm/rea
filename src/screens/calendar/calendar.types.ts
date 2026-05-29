import { Cycle, CycleSnapshot } from "../../types/cycle.types";
import { DailyLog } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

/** Props del screen de calendario del ciclo. */
export interface CalendarScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    snapshot: CycleSnapshot;
    onOpenCheckIn: () => void;
}
