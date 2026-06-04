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
