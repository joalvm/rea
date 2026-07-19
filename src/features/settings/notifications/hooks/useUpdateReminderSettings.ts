import { eq } from "drizzle-orm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import type { Database } from "@/db/client";
import { appSettings, type UpdateAppSettings } from "@/db/schema/appSettings";
import { profile } from "@/db/schema/profile";
import { useDatabase } from "@/db/useDatabase";
import { notificationCopyResolver, reprogramAll } from "@/modules/notifications";

type ReminderPatch = Pick<
    UpdateAppSettings,
    | "remindersEnabled"
    | "reminderIntervalHours"
    | "reminderWindowStart"
    | "reminderWindowEnd"
    | "notifyDailyCheckin"
    | "discreetNotifications"
>;

/**
 * Actualiza los campos de recordatorio en `app_settings` y reprograma las
 * notificaciones para que el scheduler refleje al instante la nueva
 * configuración. El `reprogramAll` es best-effort: si falla (p. ej. permiso
 * aún no concedido), los ajustes quedan guardados y se reintentará al abrir.
 */
export function useUpdateReminderSettings() {
    const { t } = useTranslation("exception");
    const database = useDatabase();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function update(patch: ReminderPatch) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await applyReminderPatch(database, patch);
            await reprogramAll(database, { resolveCopy: notificationCopyResolver() }).catch(() => {});
        } catch {
            Alert.alert(t("settings.notifications"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return { update, isSubmitting };
}

async function applyReminderPatch(database: Database, patch: ReminderPatch) {
    const localProfile = await database.select().from(profile).orderBy(profile.createdAt).limit(1).all();
    const profileRow = localProfile.at(0);
    if (!profileRow) return;

    const now = new Date().toISOString();
    await database
        .update(appSettings)
        .set({ ...patch, updatedAt: now })
        .where(eq(appSettings.userId, profileRow.id));
}
