import { Cycle } from "./cycle.types";
import { NotificationCadence } from "./notifications.types";
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
    notificationCadence: NotificationCadence | null;
}

/** Estado inicial vacío antes de bootstrap local. */
export const initialAppData: AppData = {
    settings: null,
    cycles: [],
    moodCheckIns: [],
    dailyLogs: [],
    notificationCadence: null,
};
