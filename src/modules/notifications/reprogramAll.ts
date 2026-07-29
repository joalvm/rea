import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { appSettings } from "@/db/schema/appSettings";
import { profile } from "@/db/schema/profile";

import { buildContent } from "./buildContent";
import { computeReminderSlots, type ReminderIntervalHours } from "./computeSlots";
import { canUseLocalNotifications } from "./notificationRuntime";
import * as Scheduler from "./scheduler";
import type { NotificationCopy, NotificationDeepLink, NotificationType } from "./types";

/**
 * Cancela todo lo programado por la app y lo reprograma desde la configuración
 * vigente. Idempotente: llamarlo dos veces produce el mismo set de pendientes,
 * porque los `identifier` son estables por slot.
 *
 * El horizonte "rodante" de 14 días del plan se cubre con `DailyTrigger`
 * (repetición perpetua); el recálculo en cada apertura de app corrige si la
 * configuración cambió. Sin background tasks.
 *
 * La dependencia del scheduler vive en `./scheduler` (única ventana a
 * `expo-notifications`); el resto de este archivo es lógica + DB.
 */
export async function reprogramAll(
    database: Database,
    options: {
        resolveCopy: (type: NotificationType) => NotificationCopy;
    },
): Promise<void> {
    if (!canUseLocalNotifications()) return;

    const settings = await loadSettings(database);

    // Cancelar todo lo propio antes de reprogramar. `cancelAllScheduled` es del
    // scheduler de la app (Rea es dueña única de sus notificaciones). El acceso
    // vía namespace permite espiar las llamadas en tests con `jest.spyOn`.
    await Scheduler.cancelAllScheduled();

    if (!settings?.remindersEnabled || !settings.notifyDailyCheckin) {
        return;
    }

    const slots = computeReminderSlots(
        settings.reminderWindowStart,
        settings.reminderWindowEnd,
        settings.reminderIntervalHours as ReminderIntervalHours,
    );

    for (const slot of slots) {
        const instance = buildDailyCheckinInstance(slot, settings.discreetNotifications, options.resolveCopy);
        await Scheduler.scheduleDaily({
            identifier: instance.id,
            hour: instance.hour,
            minute: instance.minute,
            content: instance.content,
        });
    }
}

async function loadSettings(database: Database) {
    const localProfile = await database.select().from(profile).orderBy(profile.createdAt).limit(1).all();
    const profileRow = localProfile.at(0);

    if (!profileRow) {
        return null;
    }

    const settingsRow = await database
        .select()
        .from(appSettings)
        .where(eq(appSettings.userId, profileRow.id))
        .limit(1)
        .all();

    return settingsRow.at(0) ?? null;
}

function buildDailyCheckinInstance(
    slot: { hour: number; minute: number },
    discreet: boolean,
    resolveCopy: (type: NotificationType) => NotificationCopy,
): {
    id: string;
    type: NotificationType;
    hour: number;
    minute: number;
    content: ReturnType<typeof buildContent>;
} {
    const type: NotificationType = "daily_checkin";
    const deepLink: NotificationDeepLink = "/checkin";

    return {
        id: `daily_checkin_${slot.hour}_${slot.minute}`,
        type,
        hour: slot.hour,
        minute: slot.minute,
        content: buildContent({ type, discreet, copy: resolveCopy(type), deepLink }),
    };
}
