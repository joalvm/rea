import { Cycle } from "./cycle.types";
import { NotificationCadence } from "./notifications.types";
import { DailyLog, MoodCheckIn } from "./records.types";
import { AppSettings } from "./settings.types";

/** Identifica pestaña principal activa de aplicacion. */
export type TabKey = "today" | "calendar" | "diary" | "statistics";

/** Snapshot de render cargado desde SQLite normalizado para stores de vista. */
export interface AppStoreData {
    settings: AppSettings | null;
    periodHistory: Cycle[];
    checkInMoments: MoodCheckIn[];
    dailyRecords: DailyLog[];
    notificationCadence: NotificationCadence | null;
}

/** Estado inicial vacío antes de bootstrap local. */
export const initialAppStoreData: AppStoreData = {
    settings: null,
    periodHistory: [],
    checkInMoments: [],
    dailyRecords: [],
    notificationCadence: null,
};
