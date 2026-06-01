import { AppData } from "../types/app.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";

/** Contexto breve que acompaña el prompt principal del check-in. */
export interface CheckInPromptContext {
    title: string;
    subtitle?: string;
}

/** Estado local del modal de check-in manejado por shell principal. */
export interface CheckInState {
    visible: boolean;
    sessionKey: number;
    mode: "daily" | "quick";
    momentType: MomentType;
    promptContext: CheckInPromptContext;
    dailyLogOnly: boolean;
    initialCheckIn: MoodCheckIn | null;
    initialDailyLog: DailyLog | null;
}

/** Estado inicial vacío para shell antes de bootstrap local. */
export const initialData: AppData = {
    settings: null,
    cycles: [],
    moodCheckIns: [],
    dailyLogs: [],
    notificationCadence: null,
};
