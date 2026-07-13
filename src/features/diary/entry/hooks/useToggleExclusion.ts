import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Alert } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";

import { setCheckinExclusion } from "../services/setCheckinExclusion";

export type UseToggleExclusionResult = {
    /** Alterna la exclusión de un registro y recarga la lista. */
    toggle: (checkinId: string, nextExcluded: boolean) => Promise<void>;
    isToggling: boolean;
};

/**
 * Orquesta el toggle de exclusión estadística desde el detalle del diario.
 * No pide confirmación (es reversible con el mismo toggle) ni muestra snackbar
 * (el feedback es el estado del toggle + el chip "No cuenta").
 *
 * `onChanged` típicamente es el `reload()` de `useCheckinsOfDay`.
 */
export function useToggleExclusion(onChanged: () => void): UseToggleExclusionResult {
    const { t: tCommon } = useTranslation("common");
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const [isToggling, setIsToggling] = useState(false);

    async function toggle(checkinId: string, nextExcluded: boolean): Promise<void> {
        if (!profile) return;
        setIsToggling(true);
        try {
            await setCheckinExclusion(database, {
                profileId: profile.id,
                checkinId,
                excluded: nextExcluded,
            });
            onChanged();
        } catch {
            Alert.alert(tCommon("feedback.error"));
        } finally {
            setIsToggling(false);
        }
    }

    return { toggle, isToggling };
}
