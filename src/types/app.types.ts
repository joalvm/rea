import { Cycle } from "./cycle.types";
import { NotificationMoment } from "./notifications.types";
import { DailyLog, MoodCheckIn } from "./records.types";
import { AppSettings } from "./settings.types";

/** Identifica pestaña principal activa de aplicacion. */
export type TabKey = "today" | "calendar" | "diary" | "patterns";

/** Agrupa datos base cargados al iniciar shell de app. */
export interface AppData {
    settings: AppSettings | null;
    cycles: Cycle[];
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
    notificationMoments: NotificationMoment[];
}