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

/** Tip contextual mostrado en el detalle del día. */
export interface DayDetailCareTip {
    icon: string;
    text: string;
    color: string;
    background: string;
}

/** Props de una fila visual para consejos del día. */
export interface DayDetailTipRowProps {
    tip: DayDetailCareTip;
}

/** Props de una fila de momento guardado dentro del detalle. */
export interface DayDetailMomentRowProps {
    entry: MoodCheckIn;
}
