import { AppData } from "@/types/app.types";

import { loadCycles } from "../repositories/cycles.repository";
import { loadDailyLogs } from "../repositories/dailyLogs.repository";
import { loadMoodCheckIns } from "../repositories/moodCheckIns.repository";
import { loadNotificationCadence } from "../repositories/notificationMoments.repository";
import { loadSettings } from "../repositories/settings.repository";

/** Carga todos los bloques de datos necesarios para shell inicial. */
export default async function loadAppData(): Promise<AppData> {
    const [settings, cycles, moodCheckIns, dailyLogs, notificationCadence] = await Promise.all([
        loadSettings(),
        loadCycles(),
        loadMoodCheckIns(),
        loadDailyLogs(),
        loadNotificationCadence(),
    ]);

    return {
        settings,
        cycles,
        moodCheckIns,
        dailyLogs,
        notificationCadence,
    };
}
