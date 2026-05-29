import { AppData } from "../types/app.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";

/** Estado local del modal de check-in manejado por shell principal. */
export interface CheckInState {
    visible: boolean;
    sessionKey: number;
    mode: "daily" | "quick";
    momentType: MomentType;
    question: string;
    saveTarget: "checkIn" | "dailyLog" | "both";
    initialCheckIn: MoodCheckIn | null;
    initialDailyLog: DailyLog | null;
}

/** Estado inicial vacío para shell antes de bootstrap local. */
export const initialData: AppData = {
    settings: null,
    cycles: [],
    moodCheckIns: [],
    dailyLogs: [],
    notificationMoments: [],
};
