import { useEffect, useState } from "react";

import type { ReproductiveMode } from "@/db/enums/reproductiveMode";
import { useDatabase } from "@/db/useDatabase";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import type { SymptomCatalog } from "@/db/schema/symptomCatalog";

import { getQuickOptions } from "../services/getQuickOptions";

/**
 * Carga los quick-options del catálogo aplicables al modo reproductivo activo
 * del perfil. No es reactivo a cambios del catálogo (suficiente para el intro,
 * que se monta por sesión de captura). Recarga si cambia el perfil o el modo.
 */
export function useQuickOptions(): {
    options: SymptomCatalog[];
    loading: boolean;
} {
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const { intent } = useActiveIntent(profile?.id ?? "");
    const mode = intent?.reproductiveMode as ReproductiveMode | undefined;

    const [options, setOptions] = useState<SymptomCatalog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const rows = await getQuickOptions(database, { mode });
                if (!cancelled) {
                    setOptions(rows);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [database, mode]);

    return { options, loading };
}
