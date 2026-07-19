import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { appSettings } from "@/db/schema/appSettings";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useDatabase } from "@/db/useDatabase";

/**
 * La fila de `app_settings` del perfil local (1:1). Reacciona sola a cambios
 * vía `useLiveQuery`: la pantalla de ajustes se actualiza al instante cuando
 * una mutación toca la tabla. Devuelve `null` si todavía no hay perfil (p. ej.
 * durante el onboarding).
 */
export function useAppSettings() {
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const profileId = profile?.id ?? "";
    const { data, error, updatedAt } = useLiveQuery(
        database.select().from(appSettings).where(eq(appSettings.userId, profileId)).limit(1),
        [profileId],
    );

    return { settings: data?.at(0) ?? null, error, updatedAt };
}
